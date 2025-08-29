import { NextRequest, NextResponse } from 'next/server';
import { getERPAdapter } from '@/erps/adapters';
import { ZPagination } from '@/erps/mapping/common.types';
import {
  ValidationError,
  NotImplementedError,
} from '@/erps/adapters/adapter.types';

type Resource = 'suppliers' | 'items' | 'purchase-orders';

function isValidResource(resource: string): resource is Resource {
  return ['suppliers', 'items', 'purchase-orders'].includes(resource);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const { resource } = await params;

    if (!isValidResource(resource)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_RESOURCE',
            message: `Invalid resource: ${resource}. Valid resources: suppliers, items, purchase-orders`,
          },
        },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const page = url.searchParams.get('page');
    const pageSize = url.searchParams.get('pageSize');

    const paginationInput = {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };

    // Validate pagination
    const validatedPagination = ZPagination.parse(paginationInput);

    const adapter = getERPAdapter();

    let result;

    switch (resource) {
      case 'suppliers':
        result = await adapter.listSuppliers(validatedPagination);
        break;
      case 'items':
        result = await adapter.listItems(validatedPagination);
        break;
      case 'purchase-orders':
        result = await adapter.listPurchaseOrders(validatedPagination);
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error fetching ${params.resource}:`, error);

    const isValidationError = error instanceof ValidationError;
    const isNotImplementedError = error instanceof NotImplementedError;

    return NextResponse.json(
      {
        error: {
          code: isValidationError
            ? 'VALIDATION_ERROR'
            : isNotImplementedError
              ? 'NOT_IMPLEMENTED'
              : 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      },
      {
        status: isValidationError ? 400 : isNotImplementedError ? 501 : 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { resource } = params;

    if (resource !== 'purchase-orders') {
      return NextResponse.json(
        {
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `POST not supported for resource: ${resource}. Only purchase-orders supports creation.`,
          },
        },
        { status: 405 }
      );
    }

    const body = await request.json();
    const adapter = getERPAdapter();

    const result = await adapter.createPurchaseOrder(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(`Error creating ${params.resource}:`, error);

    const isValidationError = error instanceof ValidationError;
    const isNotImplementedError = error instanceof NotImplementedError;

    return NextResponse.json(
      {
        error: {
          code: isValidationError
            ? 'VALIDATION_ERROR'
            : isNotImplementedError
              ? 'NOT_IMPLEMENTED'
              : 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      },
      {
        status: isValidationError ? 400 : isNotImplementedError ? 501 : 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { resource } = params;

    if (resource !== 'purchase-orders') {
      return NextResponse.json(
        {
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `PATCH not supported for resource: ${resource}. Only purchase-orders supports updates.`,
          },
        },
        { status: 405 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_ID',
            message: 'ID parameter is required for PATCH operations',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const adapter = getERPAdapter();

    const result = await adapter.updatePurchaseOrder(id, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating ${params.resource}:`, error);

    const isValidationError = error instanceof ValidationError;
    const isNotImplementedError = error instanceof NotImplementedError;

    return NextResponse.json(
      {
        error: {
          code: isValidationError
            ? 'VALIDATION_ERROR'
            : isNotImplementedError
              ? 'NOT_IMPLEMENTED'
              : 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      },
      {
        status: isValidationError ? 400 : isNotImplementedError ? 501 : 500,
      }
    );
  }
}
