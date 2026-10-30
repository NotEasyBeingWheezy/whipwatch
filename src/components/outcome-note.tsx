import { Link } from "@tanstack/react-router";

export function OutcomeNote() {
  return (
    <p className="text-sm text-muted-foreground">
      Suspension and withdrawal can differ in their intended duration, but both remove the party whip.
      In the SN02537 spreadsheet we cite, almost all suspensions are recorded as withdrawals; Scott
      Benton is the only entry labelled “Suspended”. For consistency, we have classified that entry
      as “Withdrawn” too. If Parliament revises the source, we will update WhipWatch accordingly.
      To help improve the accuracy of these records, visit our{" "}
      <Link to="/contact" className="text-primary underline underline-offset-4">Contact page</Link>.
    </p>
  );
}