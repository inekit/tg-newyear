var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Item",
  tableName: "items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    description: {
      type: "varchar",
      length: 600,
    },
    link: {
      type: "varchar",
      length: 600,
    },
    instruction: {
      type: "varchar",
      length: 2000,
    },
    price: {
      type: "double precision",
      nullable: false,
    },
    category_id: {
      type: "int",
      nullable: false,
    },
    photo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
  relations: {
    category: {
      target: "Category",
      type: "many-to-one",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
