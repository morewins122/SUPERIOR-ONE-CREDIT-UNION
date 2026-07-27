import { useEffect, useState } from "react";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { VirtualCard } from "@/components/dashboard/VirtualCard";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Transaction } from "@/types";

type Card = {
  id: string;
  last4: string;
  isFrozen: boolean;
};

export function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [cardTransactions, setCardTransactions] = useState<Transaction[]>([]);
  const [activeCardId, setActiveCardId] = useState<string>("");
  const { user } = useAuth();

  const load = async () => {
    const { data } = await api.get<Card[]>("/cards");
    setCards(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const createCard = async () => {
    await api.post("/cards/create");
    await load();
  };

  const toggleFreeze = async (card: Card) => {
    await api.post(`/cards/${card.id}/${card.isFrozen ? "unfreeze" : "freeze"}`);
    await load();
  };

  const replace = async (id: string) => {
    await api.post(`/cards/${id}/replace`);
    await load();
  };

  const loadCardTransactions = async (id: string) => {
    const { data } = await api.get<Transaction[]>(`/cards/${id}/transactions`);
    setActiveCardId(id);
    setCardTransactions(data);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cards</h1>
        <button className="rounded-full bg-ink px-4 py-2 text-white" onClick={() => void createCard()}>
          Create Virtual Card
        </button>
      </div>

      {cards.map((card) => (
        <div key={card.id} className="space-y-3 rounded-2xl panel p-4">
          <VirtualCard
            name={user ? `${user.firstName} ${user.lastName}` : "Member"}
            last4={card.last4}
            frozen={card.isFrozen}
          />
          <div className="flex gap-2">
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm" onClick={() => void toggleFreeze(card)}>
              {card.isFrozen ? "Unfreeze" : "Freeze"}
            </button>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm" onClick={() => void replace(card.id)}>
              Replace Card
            </button>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm" onClick={() => void loadCardTransactions(card.id)}>
              View History
            </button>
          </div>
        </div>
      ))}

      {activeCardId && (
        <article className="space-y-2">
          <h2 className="text-lg font-semibold">Card Transaction History</h2>
          {cardTransactions.length > 0 ? (
            <TransactionTable rows={cardTransactions} />
          ) : (
            <p className="text-sm text-slate-500">No transactions for this card yet.</p>
          )}
        </article>
      )}
    </section>
  );
}
