"use client";

import { useState } from "react";
import { Tabs, Title } from "@mantine/core";

import ThoughtsTab from "./thoughts-tab";
import ThreadsTab from "./threads-tab";
import CommentsTab from "./comments-tab";
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
          <Tabs.Tab value="threads">Threads</Tabs.Tab>
          <Tabs.Tab value="comments">Comments</Tabs.Tab>
        </Tabs.List>

        <ThoughtsTab isActive={activeTab === "thoughts"} />
        <ThreadsTab isActive={activeTab === "threads"} />
        <CommentsTab isActive={activeTab === "comments"} />
      </Tabs>
    </div>
  );
}
