import type { Thought as ThoughtType } from "@/generated/prisma/client";
import Thought from "./Thought";
import classes from "./home.module.css";

export interface ThoughtsProps {
  thoughts: ThoughtType[];
}

export default function Thoughts({ thoughts }: ThoughtsProps) {
  return (
    <div className={classes.thoughts}>
      {thoughts.map((thought) => (
        <Thought
          key={thought.id}
          message={thought.message}
          author={thought.author}
          color={thought.color}
          createdAt={thought.createdAt}
        />
      ))}
    </div>
  );
}
