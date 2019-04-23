module.exports = function(crowi, app) {

  const Tag = crowi.model('Tag');
  const PageTagRelation = crowi.model('PageTagRelation');
  const ApiResponse = require('../util/apiResponse');
  const actions = {};
  const api = {};

  actions.api = api;

  actions.showPage = function(req, res) {
    return res.render('tags');
  };

  /**
   * @api {get} /tags.search search tags
   * @apiName SearchTag
   * @apiGroup Tag
   *
   * @apiParam {String} q keyword
   */
  api.search = async function(req, res) {
    let tags = await Tag.find({ name: new RegExp(`^${req.query.q}`) }).select('-_id name');
    tags = tags.map((tag) => { return tag.name });
    return res.json(ApiResponse.success({ tags }));
  };

  /**
   * @api {get} /tags.list get tagnames and count pages relate each tag
   * @apiName tagList
   * @apiGroup Tag
   *
   * @apiParam {Number} limit
   * @apiParam {Number} offset
   */
  api.list = async function(req, res) {
    const limit = +req.query.limit || 50;
    const offset = +req.query.offset || 0;
    const sortOpt = { count: -1 };
    const queryOptions = { offset, limit, sortOpt };
    const result = {};

    try {
      // get tag list contains id and count properties
      const list = await PageTagRelation.createTagListWithCount(queryOptions);

      // get tag documents for add name data to the list
      const tags = await Tag.find({ _id: { $in: list } });

      // add name data
      result.tags = list.map((elm) => {
        const tag = tags.find((tag) => { return (tag.id === String(elm._id)) });
        elm.name = tag.name;
        return elm;
      });

      result.totalCount = await Tag.count();

      return res.json(ApiResponse.success({ result }));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };


  return actions;
};
