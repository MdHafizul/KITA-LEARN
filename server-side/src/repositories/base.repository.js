/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 */

class BaseRepository {
  constructor(prismaModel) {
    this.model = prismaModel;
  }

  /**
   * Find all records with pagination
   * @param {Object} options - { page, limit, where, orderBy, include }
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      where = {},
      orderBy = { createdAt: 'desc' },
      include = {},
    } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        include,
        skip,
        take: limit,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find single record by ID
   */
  async findById(id, include = {}) {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find first record matching condition
   */
  async findOne(where, include = {}) {
    return this.model.findFirst({
      where,
      include,
    });
  }

  /**
   * Find multiple records matching condition
   */
  async findMany(where, options = {}) {
    const { orderBy = { createdAt: 'desc' }, include = {} } = options;

    return this.model.findMany({
      where,
      orderBy,
      include,
    });
  }

  /**
   * Create new record
   */
  async create(data, include = {}) {
    return this.model.create({
      data,
      include,
    });
  }

  /**
   * Update record by ID
   */
  async update(id, data, include = {}) {
    return this.model.update({
      where: { id },
      data,
      include,
    });
  }

  /**
   * Delete record by ID
   */
  async delete(id) {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Soft delete (for models with deletedAt)
   */
  async softDelete(id) {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore soft deleted record
   */
  async restore(id) {
    return this.model.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Upsert - update if exists, create if not
   */
  async upsert(where, create, update, include = {}) {
    return this.model.upsert({
      where,
      create,
      update,
      include,
    });
  }

  /**
   * Batch create
   */
  async createMany(data) {
    return this.model.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Count records matching condition
   */
  async count(where = {}) {
    return this.model.count({ where });
  }

  /**
   * Exists - check if record exists
   */
  async exists(where) {
    const record = await this.model.findFirst({ where });
    return !!record;
  }
}

module.exports = BaseRepository;
