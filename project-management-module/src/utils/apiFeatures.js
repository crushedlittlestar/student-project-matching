/**
 * Small chainable helper around a Mongoose Query object.
 * Keeps filtering / search / sort / pagination logic in one place so it's
 * consistent across modules (Projects now, reusable by Users/Skills later).
 *
 * Usage:
 *   const features = new ApiFeatures(Project.find(baseFilter), req.query)
 *     .search(['title', 'description'])
 *     .sort()
 *     .paginate();
 *   const results = await features.query;
 *   const total = await features.countQuery(Project); // for meta.total
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Free-text search across the given fields using a case-insensitive regex.
  // Not a substitute for a real text index, but sufficient for MVP scope.
  search(fields = []) {
    if (this.queryString.search && fields.length) {
      const regex = new RegExp(this.escapeRegex(this.queryString.search), 'i');
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // e.g. ?sort=-createdAt,title
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(this.queryString.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }

  async countQuery(Model) {
    // Rebuild the filter-only part (no skip/limit) to get an accurate total.
    // Mongoose's query.getFilter() gives us exactly what has been applied so far.
    const filter = this.query.getFilter();
    return Model.countDocuments(filter);
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = ApiFeatures;
