const db = require("../models");
const Topic = db.topics;
const Op = db.Sequelize.Op;

const create = async (params) => {
    // Validate request
    if (!params.id) {
        return;
    }

    // Save Topic in the database
    return await Topic.create(params);
};


// Create and Save a new Topic
exports.create = create;

// Find a single Topic with an id

const findOne = async (id) => {
    return await Topic.findByPk(id);
};

exports.findOne = findOne;

const findAll = async () => {
    return await Topic.findAll();
};

exports.findAll = findAll;

const update = async (params) => {
    const id = params.id;

    return await Topic.update(params, {
        where: { id: id }
    })
};

// Update a Topic by the id in the request
exports.update = update;
// Delete a Topic with the specified id in the request
exports.delete = async (params) => {
    const id = params.id;

    return await Topic.destroy({
        where: { id: id }
    });
};

exports.updateOrCreate = async (params) => {
    if (!params.id)
        return;

    const t = await Topic.findByPk(params.id);
    if (t) {
        if (t.getDataValue('last_comment_id') != params.last_comment_id
            || t.getDataValue('name') != params.name)
            return await update(params);

        return true;
    } else {
        return await create(params);
    }
};
