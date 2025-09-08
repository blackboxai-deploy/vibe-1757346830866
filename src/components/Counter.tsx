"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryEntry {
  id: string;
  action: string;
  previousValue: number;
  newValue: number;
  timestamp: Date;
}

export default function Counter() {
  const [count, setCount] = useState(0);
  const [customValue, setCustomValue] = useState("");
  const [minValue, setMinValue] = useState(-1000);
  const [maxValue, setMaxValue] = useState(1000);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem("mci-counter-value");
    const savedHistory = localStorage.getItem("mci-counter-history");
    const savedMinValue = localStorage.getItem("mci-counter-min");
    const savedMaxValue = localStorage.getItem("mci-counter-max");

    if (savedCount) setCount(parseInt(savedCount, 10));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMinValue) setMinValue(parseInt(savedMinValue, 10));
    if (savedMaxValue) setMaxValue(parseInt(savedMaxValue, 10));
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("mci-counter-value", count.toString());
    localStorage.setItem("mci-counter-history", JSON.stringify(history));
    localStorage.setItem("mci-counter-min", minValue.toString());
    localStorage.setItem("mci-counter-max", maxValue.toString());
  }, [count, history, minValue, maxValue]);

  const addToHistory = useCallback((action: string, previousValue: number, newValue: number) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      action,
      previousValue,
      newValue,
      timestamp: new Date()
    };
    setHistory(prev => [entry, ...prev.slice(0, 49)]); // Manter apenas 50 entradas
  }, []);

  const increment = useCallback(() => {
    if (count < maxValue) {
      const newValue = count + 1;
      addToHistory("Incrementar (+1)", count, newValue);
      setCount(newValue);
    }
  }, [count, maxValue, addToHistory]);

  const decrement = useCallback(() => {
    if (count > minValue) {
      const newValue = count - 1;
      addToHistory("Decrementar (-1)", count, newValue);
      setCount(newValue);
    }
  }, [count, minValue, addToHistory]);

  const reset = useCallback(() => {
    addToHistory("Reset", count, 0);
    setCount(0);
  }, [count, addToHistory]);

  const setCustom = useCallback(() => {
    const value = parseInt(customValue, 10);
    if (!isNaN(value) && value >= minValue && value <= maxValue) {
      addToHistory(`Definir valor (${value})`, count, value);
      setCount(value);
      setCustomValue("");
    }
  }, [customValue, count, minValue, maxValue, addToHistory]);

  const incrementBy = useCallback((amount: number) => {
    const newValue = Math.min(Math.max(count + amount, minValue), maxValue);
    if (newValue !== count) {
      addToHistory(`${amount > 0 ? '+' : ''}${amount}`, count, newValue);
      setCount(newValue);
    }
  }, [count, minValue, maxValue, addToHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contador-mci-historico-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [history]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      
      switch (event.key) {
        case 'ArrowUp':
        case '+':
          event.preventDefault();
          increment();
          break;
        case 'ArrowDown':
        case '-':
          event.preventDefault();
          decrement();
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            reset();
          }
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            reset();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increment, decrement, reset]);

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Contador Principal */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-center">Contador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display do Contador */}
          <div className="text-center">
            <div className="text-8xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-4 transition-all duration-300 ease-in-out transform hover:scale-105">
              {count}
            </div>
            <Badge variant="outline" className="text-sm">
              Limite: {minValue} a {maxValue}
            </Badge>
          </div>

          {/* Botões Principais */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={decrement} 
              disabled={count <= minValue}
              size="lg"
              variant="outline"
              className="w-16 h-16 text-2xl hover:scale-110 transition-transform"
            >
              -
            </Button>
            <Button 
              onClick={reset} 
              size="lg"
              variant="secondary"
              className="px-8 hover:scale-105 transition-transform"
            >
              Reset
            </Button>
            <Button 
              onClick={increment} 
              disabled={count >= maxValue}
              size="lg"
              variant="outline"
              className="w-16 h-16 text-2xl hover:scale-110 transition-transform"
            >
              +
            </Button>
          </div>

          {/* Botões de Incremento Rápido */}
          <div className="grid grid-cols-4 gap-2">
            <Button 
              onClick={() => incrementBy(-10)} 
              disabled={count - 10 < minValue}
              variant="ghost"
              size="sm"
            >
              -10
            </Button>
            <Button 
              onClick={() => incrementBy(-5)} 
              disabled={count - 5 < minValue}
              variant="ghost"
              size="sm"
            >
              -5
            </Button>
            <Button 
              onClick={() => incrementBy(5)} 
              disabled={count + 5 > maxValue}
              variant="ghost"
              size="sm"
            >
              +5
            </Button>
            <Button 
              onClick={() => incrementBy(10)} 
              disabled={count + 10 > maxValue}
              variant="ghost"
              size="sm"
            >
              +10
            </Button>
          </div>

          <Separator />

          {/* Valor Customizado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Definir Valor</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Digite um valor"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCustom()}
                min={minValue}
                max={maxValue}
              />
              <Button onClick={setCustom}>Definir</Button>
            </div>
          </div>

          {/* Configurações de Limite */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Mínimo</label>
              <Input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(parseInt(e.target.value) || -1000)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Máximo</label>
              <Input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(parseInt(e.target.value) || 1000)}
              />
            </div>
          </div>

          {/* Atalhos */}
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
            <p><strong>Atalhos:</strong></p>
            <p>↑/+ = Incrementar | ↓/- = Decrementar</p>
            <p>Ctrl+R ou Ctrl+0 = Reset</p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={exportHistory} 
              disabled={history.length === 0}
              size="sm" 
              variant="outline"
            >
              Exportar
            </Button>
            <Button 
              onClick={clearHistory} 
              disabled={history.length === 0}
              size="sm" 
              variant="destructive"
            >
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            {history.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                Nenhuma operação realizada ainda
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{entry.action}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {entry.previousValue} → {entry.newValue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}