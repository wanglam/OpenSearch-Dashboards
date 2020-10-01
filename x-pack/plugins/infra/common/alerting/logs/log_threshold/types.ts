/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { i18n } from '@kbn/i18n';
import * as rt from 'io-ts';
import { commonSearchSuccessResponseFieldsRT } from '../../../utils/elasticsearch_runtime_types';

export const LOG_DOCUMENT_COUNT_ALERT_TYPE_ID = 'logs.alert.document.count';

const ThresholdTypeRT = rt.keyof({
  count: null,
  ratio: null,
});

export type ThresholdType = rt.TypeOf<typeof ThresholdTypeRT>;

// Comparators //
export enum Comparator {
  GT = 'more than',
  GT_OR_EQ = 'more than or equals',
  LT = 'less than',
  LT_OR_EQ = 'less than or equals',
  EQ = 'equals',
  NOT_EQ = 'does not equal',
  MATCH = 'matches',
  NOT_MATCH = 'does not match',
  MATCH_PHRASE = 'matches phrase',
  NOT_MATCH_PHRASE = 'does not match phrase',
}

const ComparatorRT = rt.keyof({
  [Comparator.GT]: null,
  [Comparator.GT_OR_EQ]: null,
  [Comparator.LT]: null,
  [Comparator.LT_OR_EQ]: null,
  [Comparator.EQ]: null,
  [Comparator.NOT_EQ]: null,
  [Comparator.MATCH]: null,
  [Comparator.NOT_MATCH]: null,
  [Comparator.MATCH_PHRASE]: null,
  [Comparator.NOT_MATCH_PHRASE]: null,
});

// Maps our comparators to i18n strings, some comparators have more specific wording
// depending on the field type the comparator is being used with.
export const ComparatorToi18nMap = {
  [Comparator.GT]: i18n.translate('xpack.infra.logs.alerting.comparator.gt', {
    defaultMessage: 'more than',
  }),
  [Comparator.GT_OR_EQ]: i18n.translate('xpack.infra.logs.alerting.comparator.gtOrEq', {
    defaultMessage: 'more than or equals',
  }),
  [Comparator.LT]: i18n.translate('xpack.infra.logs.alerting.comparator.lt', {
    defaultMessage: 'less than',
  }),
  [Comparator.LT_OR_EQ]: i18n.translate('xpack.infra.logs.alerting.comparator.ltOrEq', {
    defaultMessage: 'less than or equals',
  }),
  [Comparator.EQ]: i18n.translate('xpack.infra.logs.alerting.comparator.eq', {
    defaultMessage: 'is',
  }),
  [Comparator.NOT_EQ]: i18n.translate('xpack.infra.logs.alerting.comparator.notEq', {
    defaultMessage: 'is not',
  }),
  [`${Comparator.EQ}:number`]: i18n.translate('xpack.infra.logs.alerting.comparator.eqNumber', {
    defaultMessage: 'equals',
  }),
  [`${Comparator.NOT_EQ}:number`]: i18n.translate(
    'xpack.infra.logs.alerting.comparator.notEqNumber',
    {
      defaultMessage: 'does not equal',
    }
  ),
  [Comparator.MATCH]: i18n.translate('xpack.infra.logs.alerting.comparator.match', {
    defaultMessage: 'matches',
  }),
  [Comparator.NOT_MATCH]: i18n.translate('xpack.infra.logs.alerting.comparator.notMatch', {
    defaultMessage: 'does not match',
  }),
  [Comparator.MATCH_PHRASE]: i18n.translate('xpack.infra.logs.alerting.comparator.matchPhrase', {
    defaultMessage: 'matches phrase',
  }),
  [Comparator.NOT_MATCH_PHRASE]: i18n.translate(
    'xpack.infra.logs.alerting.comparator.notMatchPhrase',
    {
      defaultMessage: 'does not match phrase',
    }
  ),
};

// Alert parameters //
export enum AlertStates {
  OK,
  ALERT,
  NO_DATA,
  ERROR,
}

const ThresholdRT = rt.type({
  comparator: ComparatorRT,
  value: rt.number,
});

export type Threshold = rt.TypeOf<typeof ThresholdRT>;

export const CriterionRT = rt.type({
  field: rt.string,
  comparator: ComparatorRT,
  value: rt.union([rt.string, rt.number]),
});

export type Criterion = rt.TypeOf<typeof CriterionRT>;
export const criteriaRT = rt.array(CriterionRT);
export type Criteria = rt.TypeOf<typeof criteriaRT>;

export const countCriteriaRT = criteriaRT;
export type CountCriteria = rt.TypeOf<typeof countCriteriaRT>;

export const ratioCriteriaRT = rt.tuple([criteriaRT, criteriaRT]);
export type RatioCriteria = rt.TypeOf<typeof ratioCriteriaRT>;

export const TimeUnitRT = rt.union([
  rt.literal('s'),
  rt.literal('m'),
  rt.literal('h'),
  rt.literal('d'),
]);
export type TimeUnit = rt.TypeOf<typeof TimeUnitRT>;

export const timeSizeRT = rt.number;
export const groupByRT = rt.array(rt.string);

const RequiredAlertParamsRT = rt.type({
  // NOTE: "count" would be better named as "threshold", but this would require a
  // migration of encrypted saved objects, so we'll keep "count" until it's problematic.
  count: ThresholdRT,
  timeUnit: TimeUnitRT,
  timeSize: timeSizeRT,
});

const OptionalAlertParamsRT = rt.partial({
  groupBy: groupByRT,
});

export const alertParamsRT = rt.intersection([
  rt.type({
    criteria: countCriteriaRT,
    ...RequiredAlertParamsRT.props,
  }),
  rt.partial({
    ...OptionalAlertParamsRT.props,
  }),
]);

export type CountAlertParams = rt.TypeOf<typeof alertParamsRT>;

export const ratioAlertParamsRT = rt.intersection([
  rt.type({
    criteria: ratioCriteriaRT,
    ...RequiredAlertParamsRT.props,
  }),
  rt.partial({
    ...OptionalAlertParamsRT.props,
  }),
]);

export type RatioAlertParams = rt.TypeOf<typeof ratioAlertParamsRT>;

export const AlertParamsRT = rt.union([alertParamsRT, ratioAlertParamsRT]);
export type AlertParams = rt.TypeOf<typeof AlertParamsRT>;

export const isRatioAlert = (criteria: AlertParams['criteria']): criteria is RatioCriteria => {
  return criteria.length > 0 && Array.isArray(criteria[0]) ? true : false;
};

export const isRatioAlertParams = (params: AlertParams): params is RatioAlertParams => {
  return isRatioAlert(params.criteria);
};

export const getNumerator = (criteria: RatioCriteria): Criteria => {
  return criteria[0];
};

export const getDenominator = (criteria: RatioCriteria): Criteria => {
  return criteria[1];
};

export const hasGroupBy = (alertParams: AlertParams) => {
  const { groupBy } = alertParams;
  return groupBy && groupBy.length > 0 ? true : false;
};

// Chart previews //
const chartPreviewHistogramBucket = rt.type({
  key: rt.number,
  doc_count: rt.number,
});

// ES query responses //
export const UngroupedSearchQueryResponseRT = rt.intersection([
  commonSearchSuccessResponseFieldsRT,
  rt.intersection([
    rt.type({
      hits: rt.type({
        total: rt.type({
          value: rt.number,
        }),
      }),
    }),
    // Chart preview buckets
    rt.partial({
      aggregations: rt.type({
        histogramBuckets: rt.type({
          buckets: rt.array(chartPreviewHistogramBucket),
        }),
      }),
    }),
  ]),
]);

export type UngroupedSearchQueryResponse = rt.TypeOf<typeof UngroupedSearchQueryResponseRT>;

export const GroupedSearchQueryResponseRT = rt.intersection([
  commonSearchSuccessResponseFieldsRT,
  rt.type({
    aggregations: rt.type({
      groups: rt.intersection([
        rt.type({
          buckets: rt.array(
            rt.type({
              key: rt.record(rt.string, rt.string),
              doc_count: rt.number,
              filtered_results: rt.intersection([
                rt.type({
                  doc_count: rt.number,
                }),
                // Chart preview buckets
                rt.partial({
                  histogramBuckets: rt.type({
                    buckets: rt.array(chartPreviewHistogramBucket),
                  }),
                }),
              ]),
            })
          ),
        }),
        rt.partial({
          after_key: rt.record(rt.string, rt.string),
        }),
      ]),
    }),
    hits: rt.type({
      total: rt.type({
        value: rt.number,
      }),
    }),
  }),
]);

export type GroupedSearchQueryResponse = rt.TypeOf<typeof GroupedSearchQueryResponseRT>;