import { Link } from "@tanstack/react-router";

export function OutcomeNote() {
  return (
    <p className="text-sm text-muted-foreground">
      Suspension and withdrawal can differ in intended duration: a suspension is usually presented as
      temporary, while a withdrawal implies a more lasting removal. Either way, the MP loses the party
      whip and sits as an independent. In practice, parties, press officers, and the media often use the two terms
      interchangeably, which makes it hard to verify which applies in a given case. The SN02537 briefing
      we cite reflects this: almost every case is recorded as a withdrawal, with Scott Benton
      being the only entry labelled “Suspended”. For consistency, we have classified his entry as “Withdrawn”
      too. If Parliament revises the source, we will update WhipWatch to match. If you spot an error,
      have better information, or would like to improve the accuracy of the data, please get in touch 
      via our Contact page.{" "}
      <Link to="/contact" className="text-primary underline underline-offset-4">Contact page</Link>.
    </p>
  );
}
