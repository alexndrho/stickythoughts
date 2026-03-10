'use client';

import { useState } from 'react';
import { Tabs } from '@mantine/core';

import classes from './submissions.module.css';
import SubmittedLettersTab from './submitted-letters-tab';
import FlaggedLettersTab from './flagged-letters-tab';
import RejectedLettersTab from './rejected-letters-tab';

export interface LetterSubmissionsProps {
  isActive: boolean;
}

export default function LetterSubmissions({ isActive }: LetterSubmissionsProps) {
  const [activeTab, setActiveTab] = useState<string | null>('submitted');

  return (
    <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false} className={classes.tabs}>
      <Tabs.List mb="md">
        <Tabs.Tab value="submitted">Submitted</Tabs.Tab>
        <Tabs.Tab value="flagged">Flagged</Tabs.Tab>
        <Tabs.Tab value="rejected">Rejected</Tabs.Tab>
      </Tabs.List>

      <SubmittedLettersTab isActive={isActive && activeTab === 'submitted'} />
      <FlaggedLettersTab isActive={isActive && activeTab === 'flagged'} />
      <RejectedLettersTab isActive={isActive && activeTab === 'rejected'} />
    </Tabs>
  );
}
