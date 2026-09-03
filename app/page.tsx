import { Fragment } from "react";
import { Dashboard } from "./dashboard";
import { CommandWithShortcuts } from "./command-box";

export default function Page() {
  return (
    <Fragment>
      <Dashboard />
      <CommandWithShortcuts />
    </Fragment>
  );
}
