import Dexie from "dexie";
import { dexieCloud } from "dexie-cloud-addon";
import { templateSeeds } from "./seeds";

// Configure and export db
export const db = new Dexie("drawDB", {
  addons: [dexieCloud],
});

// Configure cloud sync
db.cloud.configure({
  databaseUrl: "https://z7zh8uf0s.dexie.cloud", // Replace with your Dexie Cloud URL if different
  requireAuth: true, // Set to true if you want to require authentication
});

db.version(1).stores({
  diagrams: "@id, lastModified, loadedFromGistId, owner, [owner+id]",
  templates: "@id, custom, owner, [owner+id]",
});

// Add owner field to all objects for sync capabilities
db.diagrams.mapToClass(class Diagram {
  constructor(init) {
    Object.assign(this, init);
    this.owner = this.owner || db.cloud.currentUserId;
  }
});

db.templates.mapToClass(class Template {
  constructor(init) {
    Object.assign(this, init);
    this.owner = this.owner || db.cloud.currentUserId;
  }
});

db.on("populate", (transaction) => {
  transaction.templates.bulkAdd(templateSeeds).catch((e) => console.log(e));
});
