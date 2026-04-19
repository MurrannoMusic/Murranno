import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  name: string;
  amount: string;
  time: string;
  type: 'in' | 'out';
  avatar?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

export const TransactionList = ({ transactions, title = "Recent Activity" }: TransactionListProps) => {
  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="heading-md">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="list-item">
            <Avatar className="h-10 w-10">
              <AvatarImage src={transaction.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {transaction.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="body-lg font-semibold truncate">{transaction.name}</p>
                <span className={cn(
                  "body-md font-bold",
                  transaction.type === 'in' ? 'text-success' : 'text-foreground'
                )}>
                  {transaction.type === 'in' ? '+' : ''}{transaction.amount}
                </span>
              </div>
              <p className="body-sm text-muted-foreground">{transaction.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};