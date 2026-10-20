import Svg, { G, Path, Rect, Circle } from 'react-native-svg';
// Same vector artwork as the landing page service cards.
export function ServiceIllustration({ kind, accent }: { kind: number; accent: string }) {
  return <Svg viewBox="0 0 360 280" width="100%" height="100%" fill="none">
    <G stroke="#1b1b1b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <Path fill="#1b1b1b" d="M174 38c-19-17-48-3-46 18-18-1-25 23-10 32-15 16 1 38 19 30l55-13c26 1 35-25 17-36 9-19-9-35-23-27z" />
      <Path fill="#fff7ee" d="M148 67c-8 14-4 35 8 42l-3 16 34 1-6-20c15-10 18-29 9-43-10-8-31-10-42 4z" />
      <Path d="m162 82-3 8 7 2m-13-16h2m23 0h2m-16 23c7 2 13-1 15-6" />
      <Path fill={accent} stroke="none" d="M137 71c-1-34 57-34 63 0l-10 5c-3-26-38-24-42-1z" />
      <Path fill="#fff7ee" d="m154 119-34 10-25 63 25 11 20-43-5 85h73l-8-80 15 29 29-10-25-53-33-12" />
      <Path d="m164 120 7 24 15-24m-32 47 30-3m-42 77-8 29m56-29 16 29" />
      {kind === 0 ? <>
        <Path fill={accent} stroke="none" d="M230 35h53v11h-20v44c-22 18-40-6-13-13V36z" />
        <Path d="m97 192-30-35-11 9 30 43c5 6 15 3 26-8M215 189l32-40 12 10-27 44c-6 7-14 4-24-1" />
        <Rect x="39" y="114" width="31" height="58" rx="5" transform="rotate(-20 39 114)" fill="#fff7ee" />
        <Path d="m47 124 15 40m-6-1 3-1" />
        <Circle cx="285" cy="158" r="30" stroke={accent} strokeWidth="4" /><Path d="m270 157 12 12 21-25" stroke={accent} strokeWidth="5" />
        <Path d="M128 245h90m-2 2 19 24h-38m-62-24-18 24h35" />
      </> : kind === 1 ? <>
        <Path d="m96 190-29-20-18 12 44 32 27-14m94-15 22-23-5-15-30 23" />
        <Path fill={accent} d="m235 124 53-22-9 62-46-24z" stroke="none" />
        <Path d="m240 142 10 29 15-4-10-23m40-35 14-12m-12 32 21 2m-29 17 14 14" stroke={accent} strokeWidth="4" />
        <Path fill="#fff7ee" d="M43 142h46v34H43z" /><Path d="m47 148 19 15 18-15" />
        <Path d="m139 243-29 27h44m36-27 10 27h31" />
        <Path d="m75 65 4-19 18 4-4 20m-22-2c-10-2-15 10-4 12 8 1 11-6 8-12m13 4c-10-2-15 10-4 12 8 1 11-6 8-12" stroke={accent} />
      </> : <>
        <Path d="m99 188-24 31 12 11 33-30m94-13 20 23 13-10-29-27" />
        <Path fill="#fff7ee" d="m225 102 76 5-7 115-76-5z" /><Path fill={accent} stroke="none" d="m236 124 43 3-3 44-43-3z" /><Path d="m234 191 44 3m-43 9 30 2m-22 18-14 47m51-44 8 44" />
        <Path d="m244 142 9 12 15-20m-128 108-12 28h37m23-28 15 28h31" />
        <Path d="m66 88 6-20 23-23 14 14-23 23-20 6zm6-20 14 14m5-33 14 14" stroke={accent} />
      </>}
    </G>
  </Svg>;
}
