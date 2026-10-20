"""Regenerate the apps' supabase-js `Database` types from the D1 schema.

    python scripts/gen-client-types.py ../murranno-music/frontend/src/integrations/supabase/types.ts

Reads src/db/schema.sql plus migrations/*.sql and rewrites only the `Tables` block of the
target file; Views/Functions/Enums and the helper types below them are kept as they are.
Relationships and enum-typed columns already in the target file are preserved.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Server-only tables the apps never query directly.
PRIVATE = re.compile(r'^(auth_\w+|idempotency_keys|withdrawal_otps)$')
TS_TYPE = {'TEXT': 'string', 'INTEGER': 'number', 'REAL': 'number', 'KOBO': 'number', 'NUMERIC': 'number',
           'BOOLEAN': 'boolean', 'JSON_TEXT': 'Json', 'TEXT_ARRAY': 'string[]'}
SKIP = re.compile(r'^(UNIQUE|PRIMARY KEY|FOREIGN KEY|CHECK|CONSTRAINT)\b', re.I)


def parse_column(line):
    m = re.match(r'(\w+)\s+([A-Z_]+)(.*)$', line)
    if not m:
        return None
    name, sql_type, rest = m.groups()
    ts = TS_TYPE.get(sql_type.upper(), 'string')
    check = re.search(rf"CHECK\s*\(\s*{name}\s+IN\s*\(([^)]*)\)", rest, re.I)
    if check:
        ts = ' | '.join(f'"{v}"' for v in re.findall(r"'([^']*)'", check.group(1)))
    upper = rest.upper()
    pk = 'PRIMARY KEY' in upper
    return name, {'ts': ts, 'nullable': not (pk or 'NOT NULL' in upper), 'optional': pk or 'DEFAULT' in upper}


def read_schema():
    tables = {}
    sql = (ROOT / 'src/db/schema.sql').read_text(encoding='utf-8')
    sql += '\n'.join(p.read_text(encoding='utf-8') for p in sorted((ROOT / 'migrations').glob('*.sql')))
    sql = re.sub(r'--[^\n]*', '', sql)
    for name, body in re.findall(r'CREATE TABLE IF NOT EXISTS (\w+)\s*\((.*?)\n\);', sql, re.S):
        cols = {}
        for raw in body.split('\n'):
            line = raw.strip().rstrip(',')
            if not line or SKIP.match(line):
                continue
            col = parse_column(line)
            if col:
                cols[col[0]] = col[1]
        tables[name] = cols
    for table, line in re.findall(r'ALTER TABLE (\w+) ADD COLUMN ([^;]+);', sql):
        col = parse_column(line.strip())
        if col and table in tables:
            tables[table][col[0]] = col[1]
    return {t: c for t, c in tables.items() if not PRIVATE.match(t)}


def read_existing(ts):
    """Per table: its Relationships block and any enum-typed Row columns."""
    found = {}
    for name, block in re.findall(r'\n      (\w+): \{\n(.*?)\n      \}(?=\n)', ts, re.S):
        rel = re.search(r'        Relationships: (\[.*?\]|\[\])\n?$', block, re.S)
        row = re.search(r'        Row: \{\n(.*?)\n        \}', block, re.S)
        enums = {}
        if row:
            for col, typ in re.findall(r'^          (\w+): (.+)$', row.group(1), re.M):
                if 'Enums' in typ:
                    enums[col] = typ.replace(' | null', '')
        found[name] = {'rel': rel.group(1) if rel else '[]', 'enums': enums}
    return found


def render(tables, existing):
    out = []
    for name in sorted(tables):
        cols = tables[name]
        old = existing.get(name, {'rel': '[]', 'enums': {}})
        def typ(col, c):
            t = old['enums'].get(col, c['ts'])
            return f'{t} | null' if c['nullable'] else t
        out.append(f'      {name}: {{')
        for section, line in (
            ('Row', lambda col, c: f'          {col}: {typ(col, c)}'),
            ('Insert', lambda col, c: f"          {col}{'?' if c['nullable'] or c['optional'] else ''}: {typ(col, c)}"),
            ('Update', lambda col, c: f'          {col}?: {typ(col, c)}'),
        ):
            out.append(f'        {section}: {{')
            out.extend(line(col, cols[col]) for col in sorted(cols))
            out.append('        }')
        out.append(f"        Relationships: {old['rel']}")
        out.append('      }')
    return '\n'.join(out)


def main(target):
    path = pathlib.Path(target)
    ts = path.read_text(encoding='utf-8')
    start = ts.index('    Tables: {\n') + len('    Tables: {\n')
    end = ts.index('\n    }\n    Views: {', start)
    tables = read_schema()
    path.write_text(ts[:start] + render(tables, read_existing(ts[start:end] + '\n')) + ts[end:], encoding='utf-8', newline='\n')
    print(f'wrote {len(tables)} tables to {path}')


if __name__ == '__main__':
    main(sys.argv[1])
