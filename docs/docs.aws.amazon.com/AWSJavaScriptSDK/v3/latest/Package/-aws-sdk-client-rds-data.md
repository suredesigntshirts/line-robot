---
Source: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/
Generated: 2026-06-12
Updated: 2026-06-12
---

# @aws-sdk/client-rds-data

-   Navigation Guide

    You are on the package index page for the Client of a service. [](/AWSJavaScriptSDK/v3/latest/client/rds-data)[Return to the Client landing page](/AWSJavaScriptSDK/v3/latest/client/rds-data)

# @aws-sdk/client-rds-data

## Description

RDS Data API

Amazon RDS provides an HTTP endpoint to run SQL statements on an Amazon Aurora DB cluster. To run these statements, you use the RDS Data API (Data API).

Data API is available with the following types of Aurora databases:

-   Aurora PostgreSQL - Serverless v2, provisioned, and Serverless v1

-   Aurora MySQL - Serverless v2, provisioned, and Serverless v1

For more information about the Data API, see [Using RDS Data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html)  in the *Amazon Aurora User Guide*.

### Installation

NPM

```javascript
npm install @aws-sdk/client-rds-data
```

Yarn

```javascript
yarn add @aws-sdk/client-rds-data
```

pnpm

```javascript
pnpm add @aws-sdk/client-rds-data
```

Add to quick navigation

## Types

| Type Name | Type |
| --- | --- |

| Type Name | Type |
| --- | --- |
| [_Record](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/_Record) | Interface |
| [_Record$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/_Record$) | Variable |
| [AccessDeniedException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/AccessDeniedException) | Class |
| [AccessDeniedException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/AccessDeniedException$) | Variable |
| [ArrayValue](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Namespace/ArrayValue) | Namespace |
| [ArrayValue](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/ArrayValue) | TypeAlias |
| [ArrayValue$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ArrayValue$) | Variable |
| [BadRequestException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/BadRequestException) | Class |
| [BadRequestException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BadRequestException$) | Variable |
| [BatchExecuteStatement$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BatchExecuteStatement$) | Variable |
| [BatchExecuteStatementCommand](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/BatchExecuteStatementCommand) | Class |
| [BatchExecuteStatementCommandInput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BatchExecuteStatementCommandInput) | Interface |
| [BatchExecuteStatementCommandOutput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BatchExecuteStatementCommandOutput) | Interface |
| [BatchExecuteStatementRequest](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BatchExecuteStatementRequest) | Interface |
| [BatchExecuteStatementRequest$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BatchExecuteStatementRequest$) | Variable |
| [BatchExecuteStatementResponse](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BatchExecuteStatementResponse) | Interface |
| [BatchExecuteStatementResponse$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BatchExecuteStatementResponse$) | Variable |
| [BeginTransaction$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BeginTransaction$) | Variable |
| [BeginTransactionCommand](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/BeginTransactionCommand) | Class |
| [BeginTransactionCommandInput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BeginTransactionCommandInput) | Interface |
| [BeginTransactionCommandOutput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BeginTransactionCommandOutput) | Interface |
| [BeginTransactionRequest](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BeginTransactionRequest) | Interface |
| [BeginTransactionRequest$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BeginTransactionRequest$) | Variable |
| [BeginTransactionResponse](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/BeginTransactionResponse) | Interface |
| [BeginTransactionResponse$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/BeginTransactionResponse$) | Variable |
| [ClientDefaults](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ClientDefaults) | Interface |
| [ClientInputEndpointParameters](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ClientInputEndpointParameters) | Interface |
| [ColumnMetadata](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ColumnMetadata) | Interface |
| [ColumnMetadata$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ColumnMetadata$) | Variable |
| [CommitTransaction$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/CommitTransaction$) | Variable |
| [CommitTransactionCommand](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/CommitTransactionCommand) | Class |
| [CommitTransactionCommandInput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/CommitTransactionCommandInput) | Interface |
| [CommitTransactionCommandOutput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/CommitTransactionCommandOutput) | Interface |
| [CommitTransactionRequest](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/CommitTransactionRequest) | Interface |
| [CommitTransactionRequest$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/CommitTransactionRequest$) | Variable |
| [CommitTransactionResponse](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/CommitTransactionResponse) | Interface |
| [CommitTransactionResponse$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/CommitTransactionResponse$) | Variable |
| [DatabaseErrorException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/DatabaseErrorException) | Class |
| [DatabaseErrorException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/DatabaseErrorException$) | Variable |
| [DatabaseNotFoundException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/DatabaseNotFoundException) | Class |
| [DatabaseNotFoundException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/DatabaseNotFoundException$) | Variable |
| [DatabaseResumingException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/DatabaseResumingException) | Class |
| [DatabaseResumingException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/DatabaseResumingException$) | Variable |
| [DatabaseUnavailableException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/DatabaseUnavailableException) | Class |
| [DatabaseUnavailableException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/DatabaseUnavailableException$) | Variable |
| [DecimalReturnType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/DecimalReturnType) | TypeAlias |
| [DecimalReturnType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/DecimalReturnType) | Variable |
| [ExecuteSql$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ExecuteSql$) | Variable |
| [ExecuteSqlCommand](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/ExecuteSqlCommand)deprecated | Class |
| [ExecuteSqlCommandInput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteSqlCommandInput) | Interface |
| [ExecuteSqlCommandOutput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteSqlCommandOutput) | Interface |
| [ExecuteSqlRequest](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteSqlRequest) | Interface |
| [ExecuteSqlRequest$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ExecuteSqlRequest$) | Variable |
| [ExecuteSqlResponse](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteSqlResponse) | Interface |
| [ExecuteSqlResponse$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ExecuteSqlResponse$) | Variable |
| [ExecuteStatement$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ExecuteStatement$) | Variable |
| [ExecuteStatementCommand](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/ExecuteStatementCommand) | Class |
| [ExecuteStatementCommandInput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteStatementCommandInput) | Interface |
| [ExecuteStatementCommandOutput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteStatementCommandOutput) | Interface |
| [ExecuteStatementRequest](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteStatementRequest) | Interface |
| [ExecuteStatementRequest$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ExecuteStatementRequest$) | Variable |
| [ExecuteStatementResponse](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ExecuteStatementResponse) | Interface |
| [ExecuteStatementResponse$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ExecuteStatementResponse$) | Variable |
| [Field](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Namespace/Field) | Namespace |
| [Field](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/Field) | TypeAlias |
| [Field$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/Field$) | Variable |
| [ForbiddenException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/ForbiddenException) | Class |
| [ForbiddenException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ForbiddenException$) | Variable |
| [HttpEndpointNotEnabledException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/HttpEndpointNotEnabledException) | Class |
| [HttpEndpointNotEnabledException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/HttpEndpointNotEnabledException$) | Variable |
| [InternalServerErrorException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/InternalServerErrorException) | Class |
| [InternalServerErrorException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/InternalServerErrorException$) | Variable |
| [InvalidResourceStateException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/InvalidResourceStateException) | Class |
| [InvalidResourceStateException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/InvalidResourceStateException$) | Variable |
| [InvalidSecretException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/InvalidSecretException) | Class |
| [InvalidSecretException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/InvalidSecretException$) | Variable |
| [LongReturnType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/LongReturnType) | TypeAlias |
| [LongReturnType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/LongReturnType) | Variable |
| [NotFoundException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/NotFoundException) | Class |
| [NotFoundException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/NotFoundException$) | Variable |
| [RDSData](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/RDSData) | Class |
| [RDSData](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RDSData) | Interface |
| [RDSDataClient](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/RDSDataClient) | Class |
| [RDSDataClientConfig](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RDSDataClientConfig) | Interface |
| [RDSDataClientConfigType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/RDSDataClientConfigType) | TypeAlias |
| [RDSDataClientResolvedConfig](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RDSDataClientResolvedConfig) | Interface |
| [RDSDataClientResolvedConfigType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/RDSDataClientResolvedConfigType) | TypeAlias |
| [RDSDataServiceException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/RDSDataServiceException) | Class |
| [RDSDataServiceException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/RDSDataServiceException$) | Variable |
| [RecordsFormatType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/RecordsFormatType) | TypeAlias |
| [RecordsFormatType](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/RecordsFormatType) | Variable |
| [ResultFrame](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ResultFrame) | Interface |
| [ResultFrame$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ResultFrame$) | Variable |
| [ResultSetMetadata](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ResultSetMetadata) | Interface |
| [ResultSetMetadata$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ResultSetMetadata$) | Variable |
| [ResultSetOptions](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/ResultSetOptions) | Interface |
| [ResultSetOptions$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ResultSetOptions$) | Variable |
| [RollbackTransaction$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/RollbackTransaction$) | Variable |
| [RollbackTransactionCommand](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/RollbackTransactionCommand) | Class |
| [RollbackTransactionCommandInput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RollbackTransactionCommandInput) | Interface |
| [RollbackTransactionCommandOutput](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RollbackTransactionCommandOutput) | Interface |
| [RollbackTransactionRequest](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RollbackTransactionRequest) | Interface |
| [RollbackTransactionRequest$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/RollbackTransactionRequest$) | Variable |
| [RollbackTransactionResponse](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RollbackTransactionResponse) | Interface |
| [RollbackTransactionResponse$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/RollbackTransactionResponse$) | Variable |
| [RuntimeExtension](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/RuntimeExtension) | Interface |
| [SecretsErrorException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/SecretsErrorException) | Class |
| [SecretsErrorException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/SecretsErrorException$) | Variable |
| [ServiceInputTypes](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/ServiceInputTypes) | TypeAlias |
| [ServiceOutputTypes](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/ServiceOutputTypes) | TypeAlias |
| [ServiceUnavailableError](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/ServiceUnavailableError) | Class |
| [ServiceUnavailableError$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/ServiceUnavailableError$) | Variable |
| [SqlParameter](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/SqlParameter) | Interface |
| [SqlParameter$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/SqlParameter$) | Variable |
| [SqlStatementResult](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/SqlStatementResult) | Interface |
| [SqlStatementResult$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/SqlStatementResult$) | Variable |
| [StatementTimeoutException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/StatementTimeoutException) | Class |
| [StatementTimeoutException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/StatementTimeoutException$) | Variable |
| [StructValue](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/StructValue) | Interface |
| [StructValue$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/StructValue$) | Variable |
| [TransactionNotFoundException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/TransactionNotFoundException) | Class |
| [TransactionNotFoundException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/TransactionNotFoundException$) | Variable |
| [TypeHint](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/TypeHint) | TypeAlias |
| [TypeHint](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/TypeHint) | Variable |
| [UnsupportedResultException](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Class/UnsupportedResultException) | Class |
| [UnsupportedResultException$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/UnsupportedResultException$) | Variable |
| [UpdateResult](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Interface/UpdateResult) | Interface |
| [UpdateResult$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/UpdateResult$) | Variable |
| [Value](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Namespace/Value) | Namespace |
| [Value](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/TypeAlias/Value) | TypeAlias |
| [Value$](/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-rds-data/Variable/Value$) | Variable |

## Table of Contents

1.  Description
2.  Installation
3.  Types
