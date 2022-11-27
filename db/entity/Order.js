var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nft_id: {
      type: "int",
      nullable: true,
    },
    customer_id: {
      type: "bigint",
      nullable: false,
    },
    count: {
      type: "int",
      nullable: false,
      default: 1,
    },
    sum: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ["created", "payed"],
      default: "created",
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
