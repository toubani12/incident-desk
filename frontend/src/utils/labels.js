import {
  AppWindow, Bug, CircleHelp, Cpu, DatabaseZap, Fish, KeyRound, Network,
} from 'lucide-react';

export const STATUS = {
  OPEN: { label: 'Ouvert', color: 'var(--c-open)' },
  ASSIGNED: { label: 'Affecté', color: 'var(--c-assigned)' },
  IN_PROGRESS: { label: 'En cours', color: 'var(--c-progress)' },
  RESOLVED: { label: 'Résolu', color: 'var(--c-resolved)' },
  CLOSED: { label: 'Clôturé', color: 'var(--c-closed)' },
};

export const PRIORITY = {
  LOW: { label: 'Basse', color: 'var(--c-closed)' },
  MEDIUM: { label: 'Moyenne', color: 'var(--c-assigned)' },
  HIGH: { label: 'Haute', color: 'var(--c-open)' },
  CRITICAL: { label: 'Critique', color: 'var(--c-critical)' },
};

export const CATEGORY = {
  NETWORK: { label: 'Réseau', icon: Network, hint: 'Panne, lenteur, Wi-Fi, VPN' },
  MALWARE: { label: 'Malware', icon: Bug, hint: 'Virus, ransomware, poste infecté' },
  PHISHING: { label: 'Phishing', icon: Fish, hint: 'Email ou lien suspect' },
  ACCESS: { label: 'Accès / compte', icon: KeyRound, hint: 'Mot de passe, droits, MFA' },
  SOFTWARE: { label: 'Logiciel', icon: AppWindow, hint: 'Bug, installation, licence' },
  HARDWARE: { label: 'Matériel', icon: Cpu, hint: 'PC, imprimante, périphérique' },
  DATA_LEAK: { label: 'Fuite de données', icon: DatabaseZap, hint: 'Données exposées ou perdues' },
  OTHER: { label: 'Autre', icon: CircleHelp, hint: 'Comportement suspect, autre' },
};

export const ROLE = {
  EMPLOYEE: 'Employé',
  TECHNICIAN: 'Technicien',
  ADMIN: 'Administrateur',
};

export const STATUS_KEYS = Object.keys(STATUS);
export const PRIORITY_KEYS = Object.keys(PRIORITY);
export const CATEGORY_KEYS = Object.keys(CATEGORY);
