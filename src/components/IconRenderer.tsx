/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Heart,
  Briefcase,
  BookOpen,
  Coins,
  Sparkles,
  Shield,
  User,
  Trophy,
  Activity,
  Map,
  Flame,
  Dumbbell,
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  HelpCircle,
  BookMarked,
  Compass,
  Zap,
  Wallet,
  DollarSign,
  Smile,
  Users,
  Church,
  Cross,
  Gamepad2,
  Coffee,
  Music,
  Camera,
  LineChart,
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const iconMap: Record<string, React.ComponentType<any>> = {
  Heart,
  Briefcase,
  BookOpen,
  Coins,
  Sparkles,
  Shield,
  User,
  Trophy,
  Activity,
  Map,
  Flame,
  Dumbbell,
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  BookMarked,
  Compass,
  Zap,
  Wallet,
  DollarSign,
  Smile,
  Users,
  Church,
  Cross,
  Gamepad2,
  Coffee,
  Music,
  Camera,
  LineChart,
};

export default function IconRenderer({ name, className = '', size = 18 }: IconRendererProps) {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
}
