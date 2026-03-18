/**
 * Alert Store — Manages notifications from the Continuous Discovery Agent.
 *
 * Alerts are contextually ranked (PRD 6.3.2) and throttled to
 * max 3 per week to prevent notification fatigue.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;

  addAlert: (alert: Alert) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  dismissAlert: (alertId: string) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      unreadCount: 0,

      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
          unreadCount: state.unreadCount + 1,
        })),

      markAsRead: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, read: true } : a
          ),
          unreadCount: Math.max(
            0,
            state.unreadCount - (get().alerts.find((a) => a.id === alertId && !a.read) ? 1 : 0)
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
          unreadCount: 0,
        })),

      dismissAlert: (alertId) =>
        set((state) => {
          const alert = state.alerts.find((a) => a.id === alertId);
          return {
            alerts: state.alerts.filter((a) => a.id !== alertId),
            unreadCount: alert && !alert.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        }),
    }),
    {
      name: 'thesis-compass-alerts',
    }
  )
);
