var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "GetMoneyAppointment",
  tableName: "get_money_appointments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    bank: {
      type: "enum",
      enum: ["sber", "tinkoff", "qiwi"],
      nullable: false,
    },
    sum: {
      type: "int",
      nullable: false,
    },
    reciept_photo_id: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    status: {
      type: "enum",
      enum: ["issued", "aprooved", "notpayed", "rejected"],
      nullable: false,
      default: "issued",
    },
    customer_id: {
      type: "bigint",
      nullable: false,
      default: 296846972,
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
  },
});
