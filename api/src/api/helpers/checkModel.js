import Users from "../models/Users.js";
import Accounts from "../models/Accounts.js";
import Store from "../models/Store.js";

const checkModel = {
    Users: async (where) => {
        return Users.findOne(where);
    },
    Account: async (where) => {
        return Accounts.findOne(where);
    },
    Store: async (where) => {
        return Store.findOne(where);
    },
};

export default checkModel;
