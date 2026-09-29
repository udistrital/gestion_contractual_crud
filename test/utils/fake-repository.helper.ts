/**
 * Repositorio en memoria que emula el subconjunto de la API de
 * `Repository<T>`/`SelectQueryBuilder<T>` de TypeORM que usan
 * PolizaService/AmparoPolizaService (vía BaseCrudService). Se usa solo en los
 * e2e de poliza/amparo-poliza, que no tienen una base de datos real
 * disponible: permite ejercitar el flujo HTTP completo (controller + service
 * + ValidationPipe global) sin depender de Postgres.
 *
 * No reimplementa TypeORM: solo soporta exactamente los patrones de
 * `where`/`andWhere` que emite BaseCrudService (igualdad, LIKE, IN, BETWEEN,
 * >=, <=), ya cubiertos exhaustivamente en base-crud.service.spec.ts.
 */

interface EntityMetadataOptions {
  columns: string[];
  relations?: string[];
}

type Direction = 'ASC' | 'DESC';

const EQUALS_PATTERN = /^\w+\.(\w+) = :([\w.]+)$/;
const LIKE_PATTERN = /^\w+\.(\w+) LIKE :([\w.]+)$/;
const IN_PATTERN = /^\w+\.(\w+) IN \(:\.\.\.([\w.]+)\)$/;
const BETWEEN_PATTERN = /^\w+\.(\w+) BETWEEN :(\w+) AND :(\w+)$/;
const GREATER_OR_EQUAL_PATTERN = /^\w+\.(\w+) >= :(\w+)$/;
const LESS_OR_EQUAL_PATTERN = /^\w+\.(\w+) <= :(\w+)$/;

function compareValues(a: any, b: any, direction: Direction): number {
  let cmp = 0;
  if (a < b) {
    cmp = -1;
  } else if (a > b) {
    cmp = 1;
  }
  return direction === 'ASC' ? cmp : -cmp;
}

function matchesWhere(row: any, where: Record<string, any>): boolean {
  return Object.entries(where).every(([key, value]) => row[key] === value);
}

function buildPredicate(
  condition: string,
  params: Record<string, any>,
): (row: any) => boolean {
  let match = EQUALS_PATTERN.exec(condition);
  if (match) {
    const [, field, paramKey] = match;
    const value = params[paramKey];
    return (row) => row[field] === value;
  }

  match = LIKE_PATTERN.exec(condition);
  if (match) {
    const [, field, paramKey] = match;
    const pattern = String(params[paramKey]).replaceAll('%', '');
    return (row) => String(row[field] ?? '').includes(pattern);
  }

  match = IN_PATTERN.exec(condition);
  if (match) {
    const [, field, paramKey] = match;
    const values: any[] = params[paramKey];
    return (row) => values.includes(row[field]);
  }

  match = BETWEEN_PATTERN.exec(condition);
  if (match) {
    const [, field, startKey, endKey] = match;
    return (row) =>
      row[field] >= params[startKey] && row[field] <= params[endKey];
  }

  match = GREATER_OR_EQUAL_PATTERN.exec(condition);
  if (match) {
    const [, field, paramKey] = match;
    return (row) => row[field] >= params[paramKey];
  }

  match = LESS_OR_EQUAL_PATTERN.exec(condition);
  if (match) {
    const [, field, paramKey] = match;
    return (row) => row[field] <= params[paramKey];
  }

  throw new Error(`Predicado no soportado en el fake de e2e: ${condition}`);
}

class FakeQueryBuilder<T extends { id: number }> {
  private predicates: Array<(row: T) => boolean> = [];
  private orderField = 'id';
  private orderDir: Direction = 'ASC';
  private takeN?: number;
  private skipN = 0;
  public readonly expressionMap = {
    joinAttributes: [] as any[],
    selects: [] as any[],
  };

  constructor(private readonly rows: () => T[]) {}

  where(condition: string, params: Record<string, any> = {}) {
    this.predicates = [buildPredicate(condition, params)];
    return this;
  }

  andWhere(condition: string, params: Record<string, any> = {}) {
    this.predicates.push(buildPredicate(condition, params));
    return this;
  }

  leftJoin() {
    return this;
  }

  addSelect() {
    return this;
  }

  select() {
    return this;
  }

  orderBy(field: string, direction: Direction) {
    this.orderField = field.split('.').pop() ?? field;
    this.orderDir = direction;
    return this;
  }

  addOrderBy() {
    return this;
  }

  take(n: number) {
    this.takeN = n;
    return this;
  }

  skip(n: number) {
    this.skipN = n;
    return this;
  }

  private filtered(): T[] {
    const field = this.orderField;
    return this.rows()
      .filter((row) => this.predicates.every((predicate) => predicate(row)))
      .sort((a: any, b: any) => compareValues(a[field], b[field], this.orderDir));
  }

  getOne(): Promise<T | null> {
    return Promise.resolve(this.filtered()[0] ?? null);
  }

  getManyAndCount(): Promise<[T[], number]> {
    let all = this.filtered();
    const total = all.length;
    if (this.skipN) all = all.slice(this.skipN);
    if (this.takeN !== undefined) all = all.slice(0, this.takeN);
    return Promise.resolve([all, total]);
  }
}

export class FakeRepository<T extends { id: number }> {
  private rows: T[] = [];
  private nextId = 1;

  public readonly metadata: any;

  constructor(options: EntityMetadataOptions) {
    this.metadata = {
      columns: options.columns.map((propertyName) => ({ propertyName })),
      relations: (options.relations ?? []).map((propertyName) => ({
        propertyName,
      })),
      findRelationWithPropertyPath: () => undefined,
    };
  }

  seed(rows: T[]) {
    this.rows = [...rows];
    this.nextId = this.rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }

  all(): T[] {
    return this.rows;
  }

  create(partial: Partial<T>): T {
    return { ...partial } as T;
  }

  save(entity: T): Promise<T> {
    entity.id ??= this.nextId++;
    const index = this.rows.findIndex((r) => r.id === entity.id);
    if (index >= 0) {
      this.rows[index] = entity;
    } else {
      this.rows.push(entity);
    }
    return Promise.resolve(entity);
  }

  update(id: number, partial: Partial<T>): Promise<{ affected: number }> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index === -1) return Promise.resolve({ affected: 0 });
    this.rows[index] = { ...this.rows[index], ...partial };
    return Promise.resolve({ affected: 1 });
  }

  delete(): Promise<never> {
    return Promise.reject(
      new Error('delete físico no debería usarse: solo borrado lógico'),
    );
  }

  remove(): Promise<never> {
    return Promise.reject(
      new Error('remove físico no debería usarse: solo borrado lógico'),
    );
  }

  find(options?: {
    where?: Record<string, any>;
    order?: Record<string, Direction>;
  }): Promise<T[]> {
    const result = this.rows.filter((row) =>
      matchesWhere(row, options?.where ?? {}),
    );
    const [firstOrder] = Object.entries(options?.order ?? {});
    if (firstOrder) {
      const [field, dir] = firstOrder;
      result.sort((a: any, b: any) => compareValues(a[field], b[field], dir));
    }
    return Promise.resolve(result);
  }

  findOne(options: { where: Record<string, any> }): Promise<T | null> {
    return Promise.resolve(
      this.rows.find((row) => matchesWhere(row, options.where)) ?? null,
    );
  }

  createQueryBuilder(): FakeQueryBuilder<T> {
    return new FakeQueryBuilder<T>(() => this.rows);
  }
}
