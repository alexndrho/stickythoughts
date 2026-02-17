"use client";

import { useState } from "react";
import { Tabs, Title } from "@mantine/core";

import dashboardClasses from "../dashboard.module.css";
import classes from "./submissions.module.css";
import SubmittedLettersTab from "./submitted-letters-tab";
import RejectedLettersTab from "./rejected-letters-tab";

export default function Content() {
  const [activeTab, setActiveTab] = useState<string | null>("submitted");

  return (
    <div className={dashboardClasses.container}>
      <Title className={dashboardClasses.title}>Letter Submissions</Title>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        keepMounted={false}
        className={classes.tabs}
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="submitted">Submitted Letters</Tabs.Tab>
          <Tabs.Tab value="rejected">Rejected Letters</Tabs.Tab>
        </Tabs.List>

        <SubmittedLettersTab isActive={activeTab === "submitted"} />
        <RejectedLettersTab isActive={activeTab === "rejected"} />
      </Tabs>
    </div>
  );
}
