"use client";

import { useState } from "react";
import { Tabs, Title } from "@mantine/core";

import ThoughtsTab from "./thoughts-tab";
import LettersTab from "./letters-tab";
import RepliesTab from "./replies-tab";
import dashboardClasses from "../dashboard.module.css";
import classes from "./deleted.module.css";

export default function Content() {
  const [activeTab, setActiveTab] = useState<string | null>("thoughts");

  return (
    <div className={dashboardClasses.container}>
      <Title className={dashboardClasses.title}>Deleted Content</Title>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        keepMounted={false}
        className={classes.tabs}
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="thoughts">Thoughts</Tabs.Tab>
          <Tabs.Tab value="letters">Letters</Tabs.Tab>
          <Tabs.Tab value="replies">Replies</Tabs.Tab>
        </Tabs.List>

        <ThoughtsTab isActive={activeTab === "thoughts"} />
        <LettersTab isActive={activeTab === "letters"} />
        <RepliesTab isActive={activeTab === "replies"} />
      </Tabs>
    </div>
  );
}
