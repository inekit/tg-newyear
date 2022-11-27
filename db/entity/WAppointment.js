var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "WAppointment",
  tableName: "withdrawal_appointments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    sum: {
      type: "int",
      nullable: false,
    },
    withdrawal_address: {
      type: "varchar",
      length: 255,
      nullable: false,
      default: "defaultAddr",
    },
    status: {
      type: "enum",
      enum: ["issued", "aprooved"],
      nullable: false,
      default: "issued",
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
  },
});
