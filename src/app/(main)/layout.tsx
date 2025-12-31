import { Container } from "@mantine/core";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollUpButton from "@/components/ScrollUpButton";
import classes from "./layout.module.css";

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={classes.container}>
      <Nav />

      <div className={classes["main-container"]}>
        <Container component="main" size="lg" className={classes.main}>
          {children}
        </Container>
      </div>

      <ScrollUpButton />
      <Footer />
    </div>
  );
}
