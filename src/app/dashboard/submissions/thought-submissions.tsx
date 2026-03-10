'use client';

import { useState } from 'react';
import { Tabs } from '@mantine/core';

import classes from './submissions.module.css';
import SubmittedThoughtsTab from './submitted-thoughts-tab';
import FlaggedThoughtsTab from './flagged-thoughts-tab';
import RejectedThoughtsTab from './rejected-thoughts-tab';

export interface ThoughtSubmissionsProps {
  isActive: boolean;
}

export default function ThoughtSubmissions({ isActive }: ThoughtSubmissionsProps) {
  const [activeTab, setActiveTab] = useState<string | null>('submitted');

  return (
    <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false} className={classes.tabs}>
      <Tabs.List mb="md">
        <Tabs.Tab value="submitted">Submitted</Tabs.Tab>
        <Tabs.Tab value="flagged">Flagged</Tabs.Tab>
        <Tabs.Tab value="rejected">Rejected</Tabs.Tab>
      </Tabs.List>

      <SubmittedThoughtsTab isActive={isActive && activeTab === 'submitted'} />
      <FlaggedThoughtsTab isActive={isActive && activeTab === 'flagged'} />
      <RejectedThoughtsTab isActive={isActive && activeTab === 'rejected'} />
    </Tabs>
  );
}
