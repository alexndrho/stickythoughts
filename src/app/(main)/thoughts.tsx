import type { PublicThoughtPayload } from "@/utils/thought";
import Thought from "./thought";
import classes from "./home.module.css";

export interface ThoughtsProps {
  thoughts: PublicThoughtPayload[];
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
