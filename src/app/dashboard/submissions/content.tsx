'use client';

import { useState } from 'react';
import { Tabs, Title } from '@mantine/core';

import dashboardClasses from '../dashboard.module.css';
import classes from './submissions.module.css';
import LetterSubmissions from './letter-submissions';
import ThoughtSubmissions from './thought-submissions';

export default function Content() {
  const [activeTab, setActiveTab] = useState<string | null>('thoughts');

  return (
    <div className={dashboardClasses.container}>
      <Title className={dashboardClasses.title}>Submissions</Title>

      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false} className={classes.tabs}>
        <Tabs.List mb="md">
          <Tabs.Tab value="thoughts">Thoughts</Tabs.Tab>
          <Tabs.Tab value="letters">Letters</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="thoughts" className={classes.panel}>
          <ThoughtSubmissions isActive={activeTab === 'thoughts'} />
        </Tabs.Panel>

        <Tabs.Panel value="letters" className={classes.panel}>
          <LetterSubmissions isActive={activeTab === 'letters'} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
