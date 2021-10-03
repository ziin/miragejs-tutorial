// Welcome to the tutorial!
// src/server.js
import {
  belongsTo,
  createServer,
  Factory,
  hasMany,
  Model,
  RestSerializer,
  trait,
} from "miragejs";

export default function () {
  createServer({
    models: {
      list: Model.extend({
        reminders: hasMany(),
      }),

      reminder: Model.extend({
        list: belongsTo(),
      }),
    },

    serializers: {
      reminder: RestSerializer.extend({
        include: ["list"],
        embed: true,
      }),
    },

    factories: {
      reminder: Factory.extend({
        text(id) {
          return `Reminder text ${id}`;
        },
      }),

      list: Factory.extend({
        name(i) {
          return `List ${i}`;
        },

        // afterCreate(list, server) {
        //   server.createList("reminder", 5, { list });
        // },

        // afterCreate(list, server) {
        //   if (!list.reminders.length) {
        //     server.createList("reminder", 5, { list });
        //   }
        // },

        withReminders: trait({
          afterCreate(list, server) {
            server.createList("reminder", 5, { list });
          },
        }),
      }),
    },

    seeds(server) {
      server.create("reminder", { text: "Walk the dog" });
      server.create("reminder", { text: "Take out the trash" });
      server.create("reminder", { text: "Working out" });

      let homeList = server.create("list", { name: "Home" });
      server.create("reminder", { list: homeList, text: "Do taxes" });

      let workList = server.create("list", { name: "Work" });
      server.create("reminder", { list: workList, text: "Visit bank" });

      // with factory
      // Create a specific reminder
      // server.create("reminder", { text: "Walk the dog" });

      // Create 5 more generic reminders
      // server.createList("reminder", 5);

      // server.create("list", {
      //   reminders: server.createList("reminder", 1),
      // });

      server.create("list", {
        name: "Home",
        reminders: [server.create("reminder", { text: "Wash dishes" })],
      });

      server.create("list");
      server.create("list", "withReminders");
    },

    routes() {
      this.get("/api/reminders", (schema) => {
        return schema.reminders.all();
      });

      this.get("/api/lists", (schema) => {
        return schema.lists.all();
      });

      this.get("/api/lists/:id/reminders", (schema, request) => {
        let listId = request.params.id;
        let list = schema.lists.find(listId);
        return list.reminders;
      });

      this.post("/api/reminders", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.reminders.create(attrs);
      });

      this.delete("/api/reminders/:id", (schema, request) => {
        let id = request.params.id;
        return schema.reminders.find(id).destroy();
      });
    },
  });
}
