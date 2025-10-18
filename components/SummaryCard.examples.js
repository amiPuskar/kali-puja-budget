// SummaryCard Component Usage Examples
// This file shows different ways to use the SummaryCard component

import React from 'react';
import { DollarSign, Users, Calendar, Target, TrendingUp, TrendingDown } from 'lucide-react';
import SummaryCard from './SummaryCard';

// Example 1: Basic 2-item summary (like Pujas page)
export const BasicSummaryExample = () => (
  <SummaryCard
    items={[
      {
        icon: Calendar,
        label: 'Total Pujas',
        value: '5',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        icon: Calendar,
        label: 'Active Pujas',
        value: '3',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      }
    ]}
  />
);

// Example 2: Dashboard stats with 4+ items
export const DashboardStatsExample = () => (
  <SummaryCard
    items={[
      {
        icon: DollarSign,
        label: 'Total Collected',
        value: '₹50,000',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        icon: TrendingDown,
        label: 'Total Spent',
        value: '₹30,000',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      {
        icon: TrendingUp,
        label: 'Remaining Balance',
        value: '₹20,000',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        icon: Users,
        label: 'Total Members',
        value: '25',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      }
    ]}
  />
);

// Example 3: Small size for compact display
export const SmallSizeExample = () => (
  <SummaryCard
    iconSize="small"
    items={[
      {
        icon: Target,
        label: 'Budget Items',
        value: '12',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        icon: DollarSign,
        label: 'Allocated',
        value: '₹45,000',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      }
    ]}
  />
);

// Example 4: Large size for prominent display
export const LargeSizeExample = () => (
  <SummaryCard
    iconSize="large"
    items={[
      {
        icon: DollarSign,
        label: 'Total Revenue',
        value: '₹1,00,000',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        subtitle: 'This month'
      }
    ]}
  />
);

// Example 5: Horizontal layout
export const HorizontalLayoutExample = () => (
  <SummaryCard
    layout="horizontal"
    items={[
      {
        icon: Users,
        label: 'Active Members',
        value: '25',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        icon: Calendar,
        label: 'Events This Month',
        value: '3',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      }
    ]}
  />
);

// Example 6: With title and subtitle
export const WithTitleExample = () => (
  <SummaryCard
    title="Financial Overview"
    subtitle="Current month statistics"
    items={[
      {
        icon: DollarSign,
        label: 'Income',
        value: '₹75,000',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        icon: TrendingDown,
        label: 'Expenses',
        value: '₹45,000',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ]}
  />
);

// Example 7: Single item with subtitle
export const SingleItemExample = () => (
  <SummaryCard
    items={[
      {
        icon: Target,
        label: 'Budget Utilization',
        value: '85%',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        subtitle: '₹38,250 of ₹45,000'
      }
    ]}
  />
);

// Example 8: Custom styling
export const CustomStylingExample = () => (
  <SummaryCard
    className="border-2 border-primary-200 bg-primary-50"
    items={[
      {
        icon: Users,
        label: 'Club Members',
        value: '50',
        color: 'text-primary-600',
        bgColor: 'bg-primary-100'
      }
    ]}
  />
);

// Example 9: Vertical layout for narrow spaces
export const VerticalLayoutExample = () => (
  <SummaryCard
    layout="vertical"
    items={[
      {
        icon: Calendar,
        label: 'Upcoming Events',
        value: '2',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        icon: Target,
        label: 'Pending Tasks',
        value: '5',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ]}
  />
);

// Example 10: Mixed content with different sizes
export const MixedContentExample = () => (
  <SummaryCard
    title="Project Status"
    subtitle="Real-time updates"
    items={[
      {
        icon: Target,
        label: 'Completed',
        value: '75%',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        subtitle: '15 of 20 tasks'
      },
      {
        icon: Calendar,
        label: 'Days Remaining',
        value: '12',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        subtitle: 'Until deadline'
      },
      {
        icon: Users,
        label: 'Team Members',
        value: '8',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        subtitle: 'Active contributors'
      }
    ]}
  />
);

const SummaryCardExamples = {
  BasicSummaryExample,
  DashboardStatsExample,
  SmallSizeExample,
  LargeSizeExample,
  HorizontalLayoutExample,
  WithTitleExample,
  SingleItemExample,
  CustomStylingExample,
  VerticalLayoutExample,
  MixedContentExample
};

export default SummaryCardExamples;
