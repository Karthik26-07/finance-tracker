import { eq, sql, type AnyColumn } from 'drizzle-orm'
import { type PgTableWithColumns } from 'drizzle-orm/pg-core'

/**
 * Global Base Repository for Drizzle ORM
 * Enforces secure userId constraints by default for multi-tenant data isolation.
 */
export abstract class BaseRepository<
  TTable extends PgTableWithColumns<any>,
  TSelect,
  TInsert,
  TUpdate
> {
  protected db: any; // Still any because it could be dynamic DB or Transaction
  protected table: TTable;

  constructor(db: any, table: TTable) {
    this.db = db;
    this.table = table;
  }

  /**
   * Returns a new instance of the repository with a transaction-safe DB connection.
   */
  abstract withTransaction(tx: any): this;

  /**
   * Returns the table object
   */
  getTable(): TTable {
    return this.table;
  }

  // ---------- READ ----------
  async findById(id: string): Promise<TSelect | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findAll(): Promise<TSelect[]> {
    return this.db.select().from(this.table);
  }

  async findWhere(whereClause: any): Promise<TSelect[]> {
    return this.db.select().from(this.table).where(whereClause);
  }

  /**
   * Securely find records scoped to a specific user
   */
  async findByUserId(userId: string): Promise<TSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).userId, userId));
  }

  async findFirst(whereClause: any): Promise<TSelect | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(whereClause)
      .limit(1);

    return result[0] ?? null;
  }

  async create(data: TInsert): Promise<TSelect> {
    const result = await this.db
      .insert(this.table)
      .values(data)
      .returning();

    return result[0];
  }

  async createMany(data: TInsert[]): Promise<TSelect[]> {
    return this.db.insert(this.table).values(data).returning();
  }

  // ---------- UPDATE ----------

  async update(id: string, data: Partial<TInsert>): Promise<TSelect> {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(eq((this.table as any).id, id))
      .returning();

    return result[0];
  }

  async updateWhere(whereClause: any, data: Partial<TInsert>) {
    return this.db
      .update(this.table)
      .set(data)
      .where(whereClause)
      .returning();
  }

  // ---------- DELETE ----------
  async delete(id: string): Promise<TSelect> {
    const result = await this.db
      .delete(this.table)
      .where(eq((this.table as any).id, id))
      .returning();

    return result[0];
  }

  async deleteWhere(whereClause: any) {
    return this.db.delete(this.table).where(whereClause).returning();
  }

  // ---------- COUNT ----------
  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.table);

    return Number(result[0]?.count ?? 0);
  }

  // ---------- TRANSACTION ----------
  async transaction<R>(cb: (tx: any) => Promise<R>): Promise<R> {
    return this.db.transaction(cb);
  }
}
