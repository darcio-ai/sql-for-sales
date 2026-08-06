export type TableDef = {
  name: string;
  columns: { name: string; type: string }[];
};

export const SCHEMA: TableDef[] = [
  {
    name: "stages",
    columns: [
      { name: "stage_order", type: "int" },
      { name: "stage_name", type: "text" },
      { name: "is_closed", type: "boolean" },
    ],
  },
  {
    name: "owners",
    columns: [
      { name: "owner_id", type: "int" },
      { name: "owner_name", type: "text" },
      { name: "team", type: "text" },
      { name: "hired_at", type: "date" },
    ],
  },
  {
    name: "companies",
    columns: [
      { name: "company_id", type: "int" },
      { name: "company_name", type: "text" },
      { name: "segment", type: "text" },
      { name: "size_band", type: "text" },
      { name: "city", type: "text" },
      { name: "state", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    name: "contacts",
    columns: [
      { name: "contact_id", type: "int" },
      { name: "company_id", type: "int" },
      { name: "full_name", type: "text" },
      { name: "email", type: "text" },
      { name: "job_title", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    name: "deals",
    columns: [
      { name: "deal_id", type: "int" },
      { name: "company_id", type: "int" },
      { name: "owner_id", type: "int" },
      { name: "deal_name", type: "text" },
      { name: "amount", type: "numeric(12,2)" },
      { name: "stage", type: "text" },
      { name: "source", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "closed_at", type: "timestamp" },
      { name: "status", type: "text" },
    ],
  },
  {
    name: "deal_stage_history",
    columns: [
      { name: "history_id", type: "bigint" },
      { name: "deal_id", type: "int" },
      { name: "stage", type: "text" },
      { name: "entered_at", type: "timestamp" },
    ],
  },
  {
    name: "activities",
    columns: [
      { name: "activity_id", type: "bigint" },
      { name: "deal_id", type: "int" },
      { name: "activity_type", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
];
