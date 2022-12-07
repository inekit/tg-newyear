var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Question",
  tableName: "questions",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    text: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ["sent", "answered"],
      nullable: false,
      default: "sent",
    },
    customer_id: {
      type: "bigint",
      nullable: false,
    },
    datetime_sent: {
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
  },
});
