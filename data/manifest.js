/* Site manifest. To add a cert/degree: create data/certs/<id>.js (copy an
   existing one) and add its id to `certs` below. Order here = order on the home page. */
window.CERTLAB_MANIFEST = {
  certs: ["fema-ics", "incident-mgmt", "itil4", "aws-ccp"],
  roadmap: [
    {
      icon: "🚒", title: "FEMA IS-100.c + IS-200.c (ICS)", certId: "fema-ics", time: "≈ 2 h + 4 h · free",
      why: "Free, fast, recognized by hospitals and emergency management. Teaches the command structure (Incident Commander, span of control, unified command) that modern tech incident response is built on.",
      links: [
        { label: "IS-100.c", url: "https://training.fema.gov/is/courseoverview.aspx?code=IS-100.c&lang=en" },
        { label: "IS-200.c", url: "https://training.fema.gov/is/courseoverview.aspx?code=IS-200.c&lang=en" }
      ]
    },
    {
      icon: "📟", title: "PagerDuty Incident Management certification", certId: "incident-mgmt", time: "free courses",
      why: "Maps ICS ideas onto software/IT incidents: severity levels, Incident Commander, Scribe, liaisons, on-call and blameless postmortems. Directly relevant to NOC / major-incident roles.",
      links: [{ label: "PagerDuty University", url: "https://university.pagerduty.com/page/certification" }, { label: "PagerDuty Incident Response docs", url: "https://response.pagerduty.com/" }]
    },
    {
      icon: "🔁", title: "ITIL 4 Foundation", certId: "itil4", time: "paid exam · 40 Q / 60 min",
      why: "The common language of IT service management (incident, problem, change, service desk, SLAs). Frequently listed in incident/problem manager and IT ops job posts. Note: PeopleCert now also offers ITIL Foundation (Version 5); ITIL 4 modules are planned to sunset 31 Dec 2027.",
      links: [{ label: "PeopleCert ITIL", url: "https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1" }]
    },
    {
      icon: "☁️", title: "AWS Cloud Practitioner (CLF-C02) / CompTIA Network+", certId: "aws-ccp", time: "paid exam · 65 Q / 90 min",
      why: "Cloud and networking literacy for triaging modern outages. AWS CCP is the gentler start; Network+ adds deeper troubleshooting (a future section).",
      links: [{ label: "AWS CCP", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/" }, { label: "CompTIA Network+", url: "https://www.comptia.org/certifications/network" }]
    }
  ]
};
