/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import QueryService from '../services/query-service';
import { Server } from 'hapi-latest';

export default function query(server: Server, service: QueryService) {
  server.route({
    path: '/api/sql_console/query',
    method: 'POST',
    handler: service.describeQuery
  });
  server.route({
    path: '/api/sql_console/querycsv',
    method: 'POST',
    handler: service.describeQueryCsv
  });
  server.route({
    path: '/api/sql_console/queryjdbc',
    method: 'POST',
    handler: service.describeQueryJdbc
  });
}