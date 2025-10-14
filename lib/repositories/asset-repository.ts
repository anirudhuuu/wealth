import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import {
  Asset,
  AssetFilters,
  CreateAssetInput,
  UpdateAssetInput,
} from "../types";
import { BaseRepository } from "./base-repository";
import { formatDateForDatabase } from "./utils";

export class AssetRepository extends BaseRepository<Asset> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "assets";
  }

  async getByUserId(userId: string): Promise<Asset[]> {
    await this.validateUser(userId);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("assets")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch assets by user"
    );
  }

  async getById(id: string, userId: string): Promise<Asset> {
    await this.validateId(id);
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("assets")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single(),
      "fetch asset by id"
    );
  }

  async create(input: CreateAssetInput, userId: string): Promise<Asset> {
    await this.validateUser(userId);

    if (!input.name?.trim()) {
      throw new ValidationError("Asset name is required");
    }

    if (!input.type) {
      throw new ValidationError("Asset type is required");
    }

    if (input.currentValue < 0) {
      throw new ValidationError("Current value cannot be negative");
    }

    if (
      input.purchaseValue !== null &&
      input.purchaseValue !== undefined &&
      input.purchaseValue < 0
    ) {
      throw new ValidationError("Purchase value cannot be negative");
    }

    const assetData = {
      user_id: userId,
      name: input.name.trim(),
      type: input.type,
      current_value: input.currentValue,
      purchase_value: input.purchaseValue,
      purchase_date: input.purchaseDate
        ? formatDateForDatabase(input.purchaseDate)
        : null,
      maturity_date: input.maturityDate
        ? formatDateForDatabase(input.maturityDate)
        : null,
      currency: input.currency || "INR",
      notes: input.notes,
    };

    return this.executeMutation(
      async () =>
        await this.supabase.from("assets").insert(assetData).select().single(),
      "create asset"
    );
  }

  async update(
    id: string,
    input: UpdateAssetInput,
    userId: string
  ): Promise<Asset> {
    await this.validateId(id);
    await this.validateUser(userId);

    if (input.name !== undefined && !input.name?.trim()) {
      throw new ValidationError("Asset name cannot be empty");
    }

    if (input.currentValue !== undefined && input.currentValue < 0) {
      throw new ValidationError("Current value cannot be negative");
    }

    if (
      input.purchaseValue !== undefined &&
      input.purchaseValue !== null &&
      input.purchaseValue < 0
    ) {
      throw new ValidationError("Purchase value cannot be negative");
    }

    const updateData: Partial<Asset> = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.currentValue !== undefined) {
      updateData.current_value = input.currentValue;
    }
    if (input.purchaseValue !== undefined) {
      updateData.purchase_value = input.purchaseValue;
    }
    if (input.purchaseDate !== undefined) {
      updateData.purchase_date = input.purchaseDate
        ? formatDateForDatabase(input.purchaseDate)
        : null;
    }
    if (input.maturityDate !== undefined) {
      updateData.maturity_date = input.maturityDate
        ? formatDateForDatabase(input.maturityDate)
        : null;
    }
    if (input.currency !== undefined) {
      updateData.currency = input.currency;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("assets")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single(),
      "update asset"
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.validateId(id);
    await this.validateUser(userId);

    const { error } = await this.supabase
      .from("assets")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "delete asset");
    }
  }

  async getWithFilters(
    userId: string,
    filters: AssetFilters = {}
  ): Promise<Asset[]> {
    await this.validateUser(userId);

    let query = this.supabase.from("assets").select("*").eq("user_id", userId);

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.currency) {
      query = query.eq("currency", filters.currency);
    }

    if (filters.minValue !== undefined) {
      query = query.gte("current_value", filters.minValue);
    }

    if (filters.maxValue !== undefined) {
      query = query.lte("current_value", filters.maxValue);
    }

    return this.executeQueryList(
      async () => await query.order("created_at", { ascending: false }),
      "fetch assets with filters"
    );
  }

  async getTotalValue(userId: string, currency?: string): Promise<number> {
    await this.validateUser(userId);

    let query = this.supabase
      .from("assets")
      .select("current_value")
      .eq("user_id", userId);

    if (currency) {
      query = query.eq("currency", currency);
    }

    const { data, error } = await query;

    if (error) {
      await this.handleError(error, "calculate total asset value");
    }

    return (data || []).reduce(
      (sum, asset) => sum + Number(asset.current_value),
      0
    );
  }

  async getValueByType(userId: string): Promise<Record<string, number>> {
    await this.validateUser(userId);

    const { data, error } = await this.supabase
      .from("assets")
      .select("type, current_value")
      .eq("user_id", userId);

    if (error) {
      await this.handleError(error, "calculate asset value by type");
    }

    const valueByType: Record<string, number> = {};

    (data || []).forEach((asset) => {
      const type = asset.type;
      valueByType[type] =
        (valueByType[type] || 0) + Number(asset.current_value);
    });

    return valueByType;
  }

  async getMaturityAlerts(
    userId: string,
    daysAhead: number = 30
  ): Promise<Asset[]> {
    await this.validateUser(userId);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("assets")
          .select("*")
          .eq("user_id", userId)
          .not("maturity_date", "is", null)
          .lte("maturity_date", formatDateForDatabase(futureDate))
          .order("maturity_date", { ascending: true }),
      "fetch assets with upcoming maturity"
    );
  }
}
