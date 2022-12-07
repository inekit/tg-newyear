var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Answer",
  tableName: "answers",
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
    answerer_id: {
      type: "bigint",
      nullable: false,
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
    answerer: {
      target: "Admin",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
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
