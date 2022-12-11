var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Report",
  tableName: "reports",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    status: {
      type: "enum",
      enum: ["issued", "aprooved", "rejected", "waiting"],
      nullable: false,
      default: "issued",
    },
    item_id: {
      type: "int",
      nullable: true,
    },
    static_id: {
      type: "int",
      nullable: true,
    },
    item_photo_id: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    customer_id: {
      type: "bigint",
      nullable: false,
    },
    datetime_created: {
      type: "timestamp",
      default: () => "NOW()",
    },
  },
  relations: {
    customer: {
      target: "User",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    item: {
      target: "Item",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    static: {
      target: "Category",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
