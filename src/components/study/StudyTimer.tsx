'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square } from 'lucide-react';

interface StudyTimerProps {
  onFinish: (duration: number, startTime: Date, endTime: Date) => void;
}

export function StudyTimer({ onFinish }: StudyTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (!isRunning) {
      setStartTime(new Date());
      setIsRunning(true);
      setIsPaused(false);
      setSeconds(0);
      setPausedTime(0);
    }
  };

  const handlePause = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
      if (!isPaused) {
        setPausedTime((prev) => prev + 1);
      }
    }
  };

  const handleStop = () => {
    if (isRunning && startTime) {
      const endTime = new Date();
      const durationMinutes = Math.floor(seconds / 60);

      if (durationMinutes < 1) {
        alert('A sessão de estudo deve ter pelo menos 1 minuto');
        return;
      }

      onFinish(durationMinutes, startTime, endTime);

      // Reset
      setIsRunning(false);
      setIsPaused(false);
      setSeconds(0);
      setStartTime(null);
      setPausedTime(0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer de Estudo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-6xl font-mono font-bold">{formatTime(seconds)}</div>
        </div>

        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="w-32">
              <Play className="mr-2 h-5 w-5" />
              Iniciar
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                size="lg"
                variant={isPaused ? 'default' : 'secondary'}
                className="w-32"
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pausar
                  </>
                )}
              </Button>
              <Button onClick={handleStop} size="lg" variant="destructive" className="w-32">
                <Square className="mr-2 h-5 w-5" />
                Parar
              </Button>
            </>
          )}
        </div>

        {isRunning && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Sessão iniciada em: {startTime?.toLocaleTimeString()}</p>
            {isPaused && <p className="text-yellow-600 font-semibold">⏸️ Pausado</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
