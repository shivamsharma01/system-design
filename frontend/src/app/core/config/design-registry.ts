import { DesignRegistryEntry } from './design-registry.model';

// --- Design metadata (statically imported; tiny, used for cards + search) ---
import { JAVA_INTERVIEW_META } from '../../features/system-designs/java-interview/java-interview.meta';
import { SPRING_BOOT_INTERVIEW_META } from '../../features/system-designs/spring-boot-interview/spring-boot-interview.meta';
import { KAFKA_INTERVIEW_META } from '../../features/system-designs/kafka-interview/kafka-interview.meta';
import { KUBERNETES_INTERVIEW_META } from '../../features/system-designs/kubernetes-interview/kubernetes-interview.meta';
import { INTERVIEW_FRAMEWORK_META } from '../../features/system-designs/interview-framework/interview-framework.meta';
import { SOLID_PRINCIPLES_META } from '../../features/system-designs/solid-principles/solid-principles.meta';
import { PARKING_LOT_META } from '../../features/system-designs/parking-lot/parking-lot.meta';
import { ELEVATOR_SYSTEM_META } from '../../features/system-designs/elevator-system/elevator-system.meta';
import { ATM_SYSTEM_META } from '../../features/system-designs/atm-system/atm-system.meta';
import { LIBRARY_MANAGEMENT_META } from '../../features/system-designs/library-management/library-management.meta';
import { CAB_BOOKING_META } from '../../features/system-designs/cab-booking/cab-booking.meta';
import { CHESS_GAME_META } from '../../features/system-designs/chess-game/chess-game.meta';
import { SNAKE_AND_LADDER_META } from '../../features/system-designs/snake-and-ladder/snake-and-ladder.meta';
import { LRU_CACHE_LLD_META } from '../../features/system-designs/lru-cache-lld/lru-cache-lld.meta';
import { MOVIE_TICKET_BOOKING_META } from '../../features/system-designs/movie-ticket-booking/movie-ticket-booking.meta';
import { SPLITWISE_META } from '../../features/system-designs/splitwise/splitwise.meta';
import { SINGLETON_META } from '../../features/system-designs/singleton/singleton.meta';
import { FACTORY_METHOD_META } from '../../features/system-designs/factory-method/factory-method.meta';
import { ABSTRACT_FACTORY_META } from '../../features/system-designs/abstract-factory/abstract-factory.meta';
import { BUILDER_META } from '../../features/system-designs/builder/builder.meta';
import { PROTOTYPE_META } from '../../features/system-designs/prototype/prototype.meta';
import { OBJECT_POOL_META } from '../../features/system-designs/object-pool/object-pool.meta';
import { ADAPTER_META } from '../../features/system-designs/adapter/adapter.meta';
import { BRIDGE_META } from '../../features/system-designs/bridge/bridge.meta';
import { COMPOSITE_META } from '../../features/system-designs/composite/composite.meta';
import { DECORATOR_META } from '../../features/system-designs/decorator/decorator.meta';
import { FACADE_META } from '../../features/system-designs/facade/facade.meta';
import { FLYWEIGHT_META } from '../../features/system-designs/flyweight/flyweight.meta';
import { PROXY_META } from '../../features/system-designs/proxy/proxy.meta';
import { CHAIN_OF_RESPONSIBILITY_META } from '../../features/system-designs/chain-of-responsibility/chain-of-responsibility.meta';
import { COMMAND_META } from '../../features/system-designs/command/command.meta';
import { ITERATOR_META } from '../../features/system-designs/iterator/iterator.meta';
import { MEDIATOR_META } from '../../features/system-designs/mediator/mediator.meta';
import { MEMENTO_META } from '../../features/system-designs/memento/memento.meta';
import { OBSERVER_META } from '../../features/system-designs/observer/observer.meta';
import { STATE_META } from '../../features/system-designs/state/state.meta';
import { STRATEGY_META } from '../../features/system-designs/strategy/strategy.meta';
import { TEMPLATE_METHOD_META } from '../../features/system-designs/template-method/template-method.meta';
import { VISITOR_META } from '../../features/system-designs/visitor/visitor.meta';
import { INTERPRETER_META } from '../../features/system-designs/interpreter/interpreter.meta';
import { NULL_OBJECT_META } from '../../features/system-designs/null-object/null-object.meta';
import { SPECIFICATION_META } from '../../features/system-designs/specification/specification.meta';
import { PRODUCER_CONSUMER_META } from '../../features/system-designs/producer-consumer/producer-consumer.meta';
import { THREAD_POOL_META } from '../../features/system-designs/thread-pool/thread-pool.meta';
import { READ_WRITE_LOCK_META } from '../../features/system-designs/read-write-lock/read-write-lock.meta';
import { DOUBLE_CHECKED_LOCKING_META } from '../../features/system-designs/double-checked-locking/double-checked-locking.meta';
import { ACTOR_MODEL_META } from '../../features/system-designs/actor-model/actor-model.meta';
import { FUTURE_PROMISE_META } from '../../features/system-designs/future-promise/future-promise.meta';
import { BALKING_META } from '../../features/system-designs/balking/balking.meta';
import { GUARDED_SUSPENSION_META } from '../../features/system-designs/guarded-suspension/guarded-suspension.meta';
import { MVC_META } from '../../features/system-designs/mvc/mvc.meta';
import { MVP_META } from '../../features/system-designs/mvp/mvp.meta';
import { MVVM_META } from '../../features/system-designs/mvvm/mvvm.meta';
import { LAYERED_ARCHITECTURE_META } from '../../features/system-designs/layered-architecture/layered-architecture.meta';
import { HEXAGONAL_ARCHITECTURE_META } from '../../features/system-designs/hexagonal-architecture/hexagonal-architecture.meta';
import { REPOSITORY_META } from '../../features/system-designs/repository/repository.meta';
import { UNIT_OF_WORK_META } from '../../features/system-designs/unit-of-work/unit-of-work.meta';
import { DTO_META } from '../../features/system-designs/dto/dto.meta';
import { ACTIVE_RECORD_META } from '../../features/system-designs/active-record/active-record.meta';
import { SERVICE_LOCATOR_META } from '../../features/system-designs/service-locator/service-locator.meta';
import { DEPENDENCY_INJECTION_META } from '../../features/system-designs/dependency-injection/dependency-injection.meta';
import { DOMAIN_DRIVEN_DESIGN_META } from '../../features/system-designs/domain-driven-design/domain-driven-design.meta';
import { HEALTH_CHECK_META } from '../../features/system-designs/health-check/health-check.meta';
import { TIMEOUT_META } from '../../features/system-designs/timeout/timeout.meta';
import { FAIL_FAST_META } from '../../features/system-designs/fail-fast/fail-fast.meta';
import { GRACEFUL_DEGRADATION_META } from '../../features/system-designs/graceful-degradation/graceful-degradation.meta';
import { BLUE_GREEN_DEPLOYMENT_META } from '../../features/system-designs/blue-green-deployment/blue-green-deployment.meta';
import { CANARY_RELEASE_META } from '../../features/system-designs/canary-release/canary-release.meta';
import { FEATURE_TOGGLE_META } from '../../features/system-designs/feature-toggle/feature-toggle.meta';
import { CHAOS_ENGINEERING_META } from '../../features/system-designs/chaos-engineering/chaos-engineering.meta';
import { AUTOSCALING_META } from '../../features/system-designs/autoscaling/autoscaling.meta';
import { PUBLISH_SUBSCRIBE_META } from '../../features/system-designs/publish-subscribe/publish-subscribe.meta';
import { EVENT_DRIVEN_ARCHITECTURE_META } from '../../features/system-designs/event-driven-architecture/event-driven-architecture.meta';
import { PIPES_AND_FILTERS_META } from '../../features/system-designs/pipes-and-filters/pipes-and-filters.meta';
import { CLAIM_CHECK_META } from '../../features/system-designs/claim-check/claim-check.meta';
import { MESSAGE_ROUTER_META } from '../../features/system-designs/message-router/message-router.meta';
import { CONTENT_BASED_ROUTER_META } from '../../features/system-designs/content-based-router/content-based-router.meta';
import { MESSAGE_FILTER_META } from '../../features/system-designs/message-filter/message-filter.meta';
import { AGGREGATOR_META } from '../../features/system-designs/aggregator/aggregator.meta';
import { DEAD_LETTER_CHANNEL_META } from '../../features/system-designs/dead-letter-channel/dead-letter-channel.meta';
import { WIRE_TAP_META } from '../../features/system-designs/wire-tap/wire-tap.meta';
import { MESSAGE_TRANSLATOR_META } from '../../features/system-designs/message-translator/message-translator.meta';
import { POLLING_CONSUMER_META } from '../../features/system-designs/polling-consumer/polling-consumer.meta';
import { EVENTUAL_CONSISTENCY_META } from '../../features/system-designs/eventual-consistency/eventual-consistency.meta';
import { ONLINE_MODEL_SERVING_META } from '../../features/system-designs/online-model-serving/online-model-serving.meta';
import { BATCH_INFERENCE_META } from '../../features/system-designs/batch-inference/batch-inference.meta';
import { FEATURE_STORE_META } from '../../features/system-designs/feature-store/feature-store.meta';
import { TRAINING_SERVING_SKEW_META } from '../../features/system-designs/training-serving-skew/training-serving-skew.meta';
import { SHADOW_DEPLOYMENT_META } from '../../features/system-designs/shadow-deployment/shadow-deployment.meta';
import { CHAMPION_CHALLENGER_META } from '../../features/system-designs/champion-challenger/champion-challenger.meta';
import { AB_TESTING_MODELS_META } from '../../features/system-designs/ab-testing-models/ab-testing-models.meta';
import { MODEL_GATEWAY_META } from '../../features/system-designs/model-gateway/model-gateway.meta';
import { ENSEMBLE_ROUTING_META } from '../../features/system-designs/ensemble-routing/ensemble-routing.meta';
import { DRIFT_DETECTION_META } from '../../features/system-designs/drift-detection/drift-detection.meta';
import { LAMBDA_ARCHITECTURE_META } from '../../features/system-designs/lambda-architecture/lambda-architecture.meta';
import { KAPPA_ARCHITECTURE_META } from '../../features/system-designs/kappa-architecture/kappa-architecture.meta';
import { ETL_PIPELINE_META } from '../../features/system-designs/etl-pipeline/etl-pipeline.meta';
import { FEATURE_PIPELINE_META } from '../../features/system-designs/feature-pipeline/feature-pipeline.meta';
import { MODEL_REGISTRY_META } from '../../features/system-designs/model-registry/model-registry.meta';
import { ML_FEEDBACK_LOOP_META } from '../../features/system-designs/ml-feedback-loop/ml-feedback-loop.meta';
import { API_GATEWAY_META } from '../../features/system-designs/api-gateway/api-gateway.meta';
import { BACKEND_FOR_FRONTEND_META } from '../../features/system-designs/backend-for-frontend/backend-for-frontend.meta';
import { SERVICE_DISCOVERY_META } from '../../features/system-designs/service-discovery/service-discovery.meta';
import { CIRCUIT_BREAKER_META } from '../../features/system-designs/circuit-breaker/circuit-breaker.meta';
import { BULKHEAD_META } from '../../features/system-designs/bulkhead/bulkhead.meta';
import { RETRY_BACKOFF_META } from '../../features/system-designs/retry-backoff/retry-backoff.meta';
import { SAGA_META } from '../../features/system-designs/saga/saga.meta';
import { TRANSACTIONAL_OUTBOX_META } from '../../features/system-designs/transactional-outbox/transactional-outbox.meta';
import { INBOX_PATTERN_META } from '../../features/system-designs/inbox-pattern/inbox-pattern.meta';
import { CQRS_META } from '../../features/system-designs/cqrs/cqrs.meta';
import { EVENT_SOURCING_META } from '../../features/system-designs/event-sourcing/event-sourcing.meta';
import { SIDECAR_META } from '../../features/system-designs/sidecar/sidecar.meta';
import { AMBASSADOR_META } from '../../features/system-designs/ambassador/ambassador.meta';
import { ANTI_CORRUPTION_LAYER_META } from '../../features/system-designs/anti-corruption-layer/anti-corruption-layer.meta';
import { STRANGLER_FIG_META } from '../../features/system-designs/strangler-fig/strangler-fig.meta';
import { DATABASE_PER_SERVICE_META } from '../../features/system-designs/database-per-service/database-per-service.meta';
import { SHARED_NOTHING_META } from '../../features/system-designs/shared-nothing/shared-nothing.meta';
import { LEADER_ELECTION_META } from '../../features/system-designs/leader-election/leader-election.meta';
import { TWO_PHASE_COMMIT_META } from '../../features/system-designs/two-phase-commit/two-phase-commit.meta';
import { THREE_PHASE_COMMIT_META } from '../../features/system-designs/three-phase-commit/three-phase-commit.meta';
import { IDEMPOTENT_CONSUMER_META } from '../../features/system-designs/idempotent-consumer/idempotent-consumer.meta';
import { COMPETING_CONSUMERS_META } from '../../features/system-designs/competing-consumers/competing-consumers.meta';
import { SCATTER_GATHER_META } from '../../features/system-designs/scatter-gather/scatter-gather.meta';
import { THROTTLING_META } from '../../features/system-designs/throttling/throttling.meta';
import { RATE_LIMITER_PATTERN_META } from '../../features/system-designs/rate-limiter-pattern/rate-limiter-pattern.meta';
import { CACHE_ASIDE_META } from '../../features/system-designs/cache-aside/cache-aside.meta';
import { READ_WRITE_THROUGH_CACHE_META } from '../../features/system-designs/read-write-through-cache/read-write-through-cache.meta';
import { WRITE_BEHIND_CACHE_META } from '../../features/system-designs/write-behind-cache/write-behind-cache.meta';
import { MATERIALIZED_VIEW_META } from '../../features/system-designs/materialized-view/materialized-view.meta';
import { SHARDING_PATTERN_META } from '../../features/system-designs/sharding-pattern/sharding-pattern.meta';
import { CONSISTENT_HASHING_META } from '../../features/system-designs/consistent-hashing/consistent-hashing.meta';
import { QUORUM_META } from '../../features/system-designs/quorum/quorum.meta';
import { GOSSIP_PROTOCOL_META } from '../../features/system-designs/gossip-protocol/gossip-protocol.meta';
import { NETFLIX_META } from '../../features/system-designs/netflix/netflix.meta';
import { URL_SHORTENER_META } from '../../features/system-designs/url-shortener/url-shortener.meta';
import { WHATSAPP_META } from '../../features/system-designs/whatsapp/whatsapp.meta';
import { UBER_META } from '../../features/system-designs/uber/uber.meta';
import { TWITTER_META } from '../../features/system-designs/twitter/twitter.meta';
import { YOUTUBE_META } from '../../features/system-designs/youtube/youtube.meta';
import { INSTAGRAM_META } from '../../features/system-designs/instagram/instagram.meta';
import { DISCORD_META } from '../../features/system-designs/discord/discord.meta';
import { RATE_LIMITER_META } from '../../features/system-designs/rate-limiter/rate-limiter.meta';
import { NOTIFICATION_SYSTEM_META } from '../../features/system-designs/notification-system/notification-system.meta';
import { DISTRIBUTED_CACHE_META } from '../../features/system-designs/distributed-cache/distributed-cache.meta';
import { PAYMENT_GATEWAY_META } from '../../features/system-designs/payment-gateway/payment-gateway.meta';
import { ZOMATO_META } from '../../features/system-designs/zomato/zomato.meta';
import { SPOTIFY_META } from '../../features/system-designs/spotify/spotify.meta';
import { AMAZON_META } from '../../features/system-designs/amazon/amazon.meta';
import { DROPBOX_META } from '../../features/system-designs/dropbox/dropbox.meta';
import { CAP_PACELC_META } from '../../features/system-designs/cap-pacelc/cap-pacelc.meta';
import { DELIVERY_SEMANTICS_META } from '../../features/system-designs/delivery-semantics/delivery-semantics.meta';
import { BACK_OF_ENVELOPE_META } from '../../features/system-designs/back-of-envelope/back-of-envelope.meta';
import { ID_GENERATION_META } from '../../features/system-designs/id-generation/id-generation.meta';
import { LOAD_BALANCING_PATTERN_META } from '../../features/system-designs/load-balancing-pattern/load-balancing-pattern.meta';
import { SERVICE_MESH_META } from '../../features/system-designs/service-mesh/service-mesh.meta';
import { VENDING_MACHINE_META } from '../../features/system-designs/vending-machine/vending-machine.meta';
import { HOTEL_RESERVATION_META } from '../../features/system-designs/hotel-reservation/hotel-reservation.meta';

/**
 * The single source of truth for the catalog.
 *
 * To add a System Design:
 *   1. Create `features/system-designs/<slug>/<slug>.meta.ts` and `<slug>.content.ts`.
 *   2. Add one entry below (import the meta + a lazy `load`).
 * Nothing else in the app needs to change. The `npm run new:design` script
 * automates all of the above.
 */
export const DESIGN_REGISTRY: DesignRegistryEntry[] = [
  {
    meta: JAVA_INTERVIEW_META,
    load: () => import('../../features/system-designs/java-interview/java-interview.content'),
  },
  {
    meta: SPRING_BOOT_INTERVIEW_META,
    load: () =>
      import('../../features/system-designs/spring-boot-interview/spring-boot-interview.content'),
  },
  {
    meta: KAFKA_INTERVIEW_META,
    load: () => import('../../features/system-designs/kafka-interview/kafka-interview.content'),
  },
  {
    meta: KUBERNETES_INTERVIEW_META,
    load: () =>
      import('../../features/system-designs/kubernetes-interview/kubernetes-interview.content'),
  },
  {
    meta: INTERVIEW_FRAMEWORK_META,
    load: () =>
      import('../../features/system-designs/interview-framework/interview-framework.content'),
  },
  {
    meta: SOLID_PRINCIPLES_META,
    load: () => import('../../features/system-designs/solid-principles/solid-principles.content'),
  },
  {
    meta: PARKING_LOT_META,
    load: () => import('../../features/system-designs/parking-lot/parking-lot.content'),
  },
  {
    meta: ELEVATOR_SYSTEM_META,
    load: () => import('../../features/system-designs/elevator-system/elevator-system.content'),
  },
  {
    meta: ATM_SYSTEM_META,
    load: () => import('../../features/system-designs/atm-system/atm-system.content'),
  },
  {
    meta: LIBRARY_MANAGEMENT_META,
    load: () =>
      import('../../features/system-designs/library-management/library-management.content'),
  },
  {
    meta: CAB_BOOKING_META,
    load: () => import('../../features/system-designs/cab-booking/cab-booking.content'),
  },
  {
    meta: CHESS_GAME_META,
    load: () => import('../../features/system-designs/chess-game/chess-game.content'),
  },
  {
    meta: SNAKE_AND_LADDER_META,
    load: () => import('../../features/system-designs/snake-and-ladder/snake-and-ladder.content'),
  },
  {
    meta: LRU_CACHE_LLD_META,
    load: () => import('../../features/system-designs/lru-cache-lld/lru-cache-lld.content'),
  },
  {
    meta: MOVIE_TICKET_BOOKING_META,
    load: () =>
      import('../../features/system-designs/movie-ticket-booking/movie-ticket-booking.content'),
  },
  {
    meta: SPLITWISE_META,
    load: () => import('../../features/system-designs/splitwise/splitwise.content'),
  },
  {
    meta: SINGLETON_META,
    load: () => import('../../features/system-designs/singleton/singleton.content'),
  },
  {
    meta: FACTORY_METHOD_META,
    load: () => import('../../features/system-designs/factory-method/factory-method.content'),
  },
  {
    meta: ABSTRACT_FACTORY_META,
    load: () => import('../../features/system-designs/abstract-factory/abstract-factory.content'),
  },
  {
    meta: BUILDER_META,
    load: () => import('../../features/system-designs/builder/builder.content'),
  },
  {
    meta: PROTOTYPE_META,
    load: () => import('../../features/system-designs/prototype/prototype.content'),
  },
  {
    meta: OBJECT_POOL_META,
    load: () => import('../../features/system-designs/object-pool/object-pool.content'),
  },
  {
    meta: ADAPTER_META,
    load: () => import('../../features/system-designs/adapter/adapter.content'),
  },
  {
    meta: BRIDGE_META,
    load: () => import('../../features/system-designs/bridge/bridge.content'),
  },
  {
    meta: COMPOSITE_META,
    load: () => import('../../features/system-designs/composite/composite.content'),
  },
  {
    meta: DECORATOR_META,
    load: () => import('../../features/system-designs/decorator/decorator.content'),
  },
  {
    meta: FACADE_META,
    load: () => import('../../features/system-designs/facade/facade.content'),
  },
  {
    meta: FLYWEIGHT_META,
    load: () => import('../../features/system-designs/flyweight/flyweight.content'),
  },
  {
    meta: PROXY_META,
    load: () => import('../../features/system-designs/proxy/proxy.content'),
  },
  {
    meta: CHAIN_OF_RESPONSIBILITY_META,
    load: () =>
      import('../../features/system-designs/chain-of-responsibility/chain-of-responsibility.content'),
  },
  {
    meta: COMMAND_META,
    load: () => import('../../features/system-designs/command/command.content'),
  },
  {
    meta: ITERATOR_META,
    load: () => import('../../features/system-designs/iterator/iterator.content'),
  },
  {
    meta: MEDIATOR_META,
    load: () => import('../../features/system-designs/mediator/mediator.content'),
  },
  {
    meta: MEMENTO_META,
    load: () => import('../../features/system-designs/memento/memento.content'),
  },
  {
    meta: OBSERVER_META,
    load: () => import('../../features/system-designs/observer/observer.content'),
  },
  {
    meta: STATE_META,
    load: () => import('../../features/system-designs/state/state.content'),
  },
  {
    meta: STRATEGY_META,
    load: () => import('../../features/system-designs/strategy/strategy.content'),
  },
  {
    meta: TEMPLATE_METHOD_META,
    load: () => import('../../features/system-designs/template-method/template-method.content'),
  },
  {
    meta: VISITOR_META,
    load: () => import('../../features/system-designs/visitor/visitor.content'),
  },
  {
    meta: INTERPRETER_META,
    load: () => import('../../features/system-designs/interpreter/interpreter.content'),
  },
  {
    meta: NULL_OBJECT_META,
    load: () => import('../../features/system-designs/null-object/null-object.content'),
  },
  {
    meta: SPECIFICATION_META,
    load: () => import('../../features/system-designs/specification/specification.content'),
  },
  {
    meta: PRODUCER_CONSUMER_META,
    load: () => import('../../features/system-designs/producer-consumer/producer-consumer.content'),
  },
  {
    meta: THREAD_POOL_META,
    load: () => import('../../features/system-designs/thread-pool/thread-pool.content'),
  },
  {
    meta: READ_WRITE_LOCK_META,
    load: () => import('../../features/system-designs/read-write-lock/read-write-lock.content'),
  },
  {
    meta: DOUBLE_CHECKED_LOCKING_META,
    load: () =>
      import('../../features/system-designs/double-checked-locking/double-checked-locking.content'),
  },
  {
    meta: ACTOR_MODEL_META,
    load: () => import('../../features/system-designs/actor-model/actor-model.content'),
  },
  {
    meta: FUTURE_PROMISE_META,
    load: () => import('../../features/system-designs/future-promise/future-promise.content'),
  },
  {
    meta: BALKING_META,
    load: () => import('../../features/system-designs/balking/balking.content'),
  },
  {
    meta: GUARDED_SUSPENSION_META,
    load: () =>
      import('../../features/system-designs/guarded-suspension/guarded-suspension.content'),
  },
  {
    meta: MVC_META,
    load: () => import('../../features/system-designs/mvc/mvc.content'),
  },
  {
    meta: MVP_META,
    load: () => import('../../features/system-designs/mvp/mvp.content'),
  },
  {
    meta: MVVM_META,
    load: () => import('../../features/system-designs/mvvm/mvvm.content'),
  },
  {
    meta: LAYERED_ARCHITECTURE_META,
    load: () =>
      import('../../features/system-designs/layered-architecture/layered-architecture.content'),
  },
  {
    meta: HEXAGONAL_ARCHITECTURE_META,
    load: () =>
      import('../../features/system-designs/hexagonal-architecture/hexagonal-architecture.content'),
  },
  {
    meta: REPOSITORY_META,
    load: () => import('../../features/system-designs/repository/repository.content'),
  },
  {
    meta: UNIT_OF_WORK_META,
    load: () => import('../../features/system-designs/unit-of-work/unit-of-work.content'),
  },
  {
    meta: DTO_META,
    load: () => import('../../features/system-designs/dto/dto.content'),
  },
  {
    meta: ACTIVE_RECORD_META,
    load: () => import('../../features/system-designs/active-record/active-record.content'),
  },
  {
    meta: SERVICE_LOCATOR_META,
    load: () => import('../../features/system-designs/service-locator/service-locator.content'),
  },
  {
    meta: DEPENDENCY_INJECTION_META,
    load: () =>
      import('../../features/system-designs/dependency-injection/dependency-injection.content'),
  },
  {
    meta: DOMAIN_DRIVEN_DESIGN_META,
    load: () =>
      import('../../features/system-designs/domain-driven-design/domain-driven-design.content'),
  },
  {
    meta: HEALTH_CHECK_META,
    load: () => import('../../features/system-designs/health-check/health-check.content'),
  },
  {
    meta: TIMEOUT_META,
    load: () => import('../../features/system-designs/timeout/timeout.content'),
  },
  {
    meta: FAIL_FAST_META,
    load: () => import('../../features/system-designs/fail-fast/fail-fast.content'),
  },
  {
    meta: GRACEFUL_DEGRADATION_META,
    load: () =>
      import('../../features/system-designs/graceful-degradation/graceful-degradation.content'),
  },
  {
    meta: BLUE_GREEN_DEPLOYMENT_META,
    load: () =>
      import('../../features/system-designs/blue-green-deployment/blue-green-deployment.content'),
  },
  {
    meta: CANARY_RELEASE_META,
    load: () => import('../../features/system-designs/canary-release/canary-release.content'),
  },
  {
    meta: FEATURE_TOGGLE_META,
    load: () => import('../../features/system-designs/feature-toggle/feature-toggle.content'),
  },
  {
    meta: CHAOS_ENGINEERING_META,
    load: () => import('../../features/system-designs/chaos-engineering/chaos-engineering.content'),
  },
  {
    meta: AUTOSCALING_META,
    load: () => import('../../features/system-designs/autoscaling/autoscaling.content'),
  },
  {
    meta: PUBLISH_SUBSCRIBE_META,
    load: () => import('../../features/system-designs/publish-subscribe/publish-subscribe.content'),
  },
  {
    meta: EVENT_DRIVEN_ARCHITECTURE_META,
    load: () =>
      import('../../features/system-designs/event-driven-architecture/event-driven-architecture.content'),
  },
  {
    meta: PIPES_AND_FILTERS_META,
    load: () => import('../../features/system-designs/pipes-and-filters/pipes-and-filters.content'),
  },
  {
    meta: CLAIM_CHECK_META,
    load: () => import('../../features/system-designs/claim-check/claim-check.content'),
  },
  {
    meta: MESSAGE_ROUTER_META,
    load: () => import('../../features/system-designs/message-router/message-router.content'),
  },
  {
    meta: CONTENT_BASED_ROUTER_META,
    load: () =>
      import('../../features/system-designs/content-based-router/content-based-router.content'),
  },
  {
    meta: MESSAGE_FILTER_META,
    load: () => import('../../features/system-designs/message-filter/message-filter.content'),
  },
  {
    meta: AGGREGATOR_META,
    load: () => import('../../features/system-designs/aggregator/aggregator.content'),
  },
  {
    meta: DEAD_LETTER_CHANNEL_META,
    load: () =>
      import('../../features/system-designs/dead-letter-channel/dead-letter-channel.content'),
  },
  {
    meta: WIRE_TAP_META,
    load: () => import('../../features/system-designs/wire-tap/wire-tap.content'),
  },
  {
    meta: MESSAGE_TRANSLATOR_META,
    load: () =>
      import('../../features/system-designs/message-translator/message-translator.content'),
  },
  {
    meta: POLLING_CONSUMER_META,
    load: () => import('../../features/system-designs/polling-consumer/polling-consumer.content'),
  },
  {
    meta: EVENTUAL_CONSISTENCY_META,
    load: () =>
      import('../../features/system-designs/eventual-consistency/eventual-consistency.content'),
  },
  {
    meta: ONLINE_MODEL_SERVING_META,
    load: () =>
      import('../../features/system-designs/online-model-serving/online-model-serving.content'),
  },
  {
    meta: BATCH_INFERENCE_META,
    load: () => import('../../features/system-designs/batch-inference/batch-inference.content'),
  },
  {
    meta: FEATURE_STORE_META,
    load: () => import('../../features/system-designs/feature-store/feature-store.content'),
  },
  {
    meta: TRAINING_SERVING_SKEW_META,
    load: () =>
      import('../../features/system-designs/training-serving-skew/training-serving-skew.content'),
  },
  {
    meta: SHADOW_DEPLOYMENT_META,
    load: () => import('../../features/system-designs/shadow-deployment/shadow-deployment.content'),
  },
  {
    meta: CHAMPION_CHALLENGER_META,
    load: () =>
      import('../../features/system-designs/champion-challenger/champion-challenger.content'),
  },
  {
    meta: AB_TESTING_MODELS_META,
    load: () => import('../../features/system-designs/ab-testing-models/ab-testing-models.content'),
  },
  {
    meta: MODEL_GATEWAY_META,
    load: () => import('../../features/system-designs/model-gateway/model-gateway.content'),
  },
  {
    meta: ENSEMBLE_ROUTING_META,
    load: () => import('../../features/system-designs/ensemble-routing/ensemble-routing.content'),
  },
  {
    meta: DRIFT_DETECTION_META,
    load: () => import('../../features/system-designs/drift-detection/drift-detection.content'),
  },
  {
    meta: LAMBDA_ARCHITECTURE_META,
    load: () =>
      import('../../features/system-designs/lambda-architecture/lambda-architecture.content'),
  },
  {
    meta: KAPPA_ARCHITECTURE_META,
    load: () =>
      import('../../features/system-designs/kappa-architecture/kappa-architecture.content'),
  },
  {
    meta: ETL_PIPELINE_META,
    load: () => import('../../features/system-designs/etl-pipeline/etl-pipeline.content'),
  },
  {
    meta: FEATURE_PIPELINE_META,
    load: () => import('../../features/system-designs/feature-pipeline/feature-pipeline.content'),
  },
  {
    meta: MODEL_REGISTRY_META,
    load: () => import('../../features/system-designs/model-registry/model-registry.content'),
  },
  {
    meta: ML_FEEDBACK_LOOP_META,
    load: () => import('../../features/system-designs/ml-feedback-loop/ml-feedback-loop.content'),
  },
  {
    meta: API_GATEWAY_META,
    load: () => import('../../features/system-designs/api-gateway/api-gateway.content'),
  },
  {
    meta: BACKEND_FOR_FRONTEND_META,
    load: () =>
      import('../../features/system-designs/backend-for-frontend/backend-for-frontend.content'),
  },
  {
    meta: SERVICE_DISCOVERY_META,
    load: () => import('../../features/system-designs/service-discovery/service-discovery.content'),
  },
  {
    meta: CIRCUIT_BREAKER_META,
    load: () => import('../../features/system-designs/circuit-breaker/circuit-breaker.content'),
  },
  {
    meta: BULKHEAD_META,
    load: () => import('../../features/system-designs/bulkhead/bulkhead.content'),
  },
  {
    meta: RETRY_BACKOFF_META,
    load: () => import('../../features/system-designs/retry-backoff/retry-backoff.content'),
  },
  {
    meta: SAGA_META,
    load: () => import('../../features/system-designs/saga/saga.content'),
  },
  {
    meta: TRANSACTIONAL_OUTBOX_META,
    load: () =>
      import('../../features/system-designs/transactional-outbox/transactional-outbox.content'),
  },
  {
    meta: INBOX_PATTERN_META,
    load: () => import('../../features/system-designs/inbox-pattern/inbox-pattern.content'),
  },
  {
    meta: CQRS_META,
    load: () => import('../../features/system-designs/cqrs/cqrs.content'),
  },
  {
    meta: EVENT_SOURCING_META,
    load: () => import('../../features/system-designs/event-sourcing/event-sourcing.content'),
  },
  {
    meta: SIDECAR_META,
    load: () => import('../../features/system-designs/sidecar/sidecar.content'),
  },
  {
    meta: AMBASSADOR_META,
    load: () => import('../../features/system-designs/ambassador/ambassador.content'),
  },
  {
    meta: ANTI_CORRUPTION_LAYER_META,
    load: () =>
      import('../../features/system-designs/anti-corruption-layer/anti-corruption-layer.content'),
  },
  {
    meta: STRANGLER_FIG_META,
    load: () => import('../../features/system-designs/strangler-fig/strangler-fig.content'),
  },
  {
    meta: DATABASE_PER_SERVICE_META,
    load: () =>
      import('../../features/system-designs/database-per-service/database-per-service.content'),
  },
  {
    meta: SHARED_NOTHING_META,
    load: () => import('../../features/system-designs/shared-nothing/shared-nothing.content'),
  },
  {
    meta: LEADER_ELECTION_META,
    load: () => import('../../features/system-designs/leader-election/leader-election.content'),
  },
  {
    meta: TWO_PHASE_COMMIT_META,
    load: () => import('../../features/system-designs/two-phase-commit/two-phase-commit.content'),
  },
  {
    meta: THREE_PHASE_COMMIT_META,
    load: () =>
      import('../../features/system-designs/three-phase-commit/three-phase-commit.content'),
  },
  {
    meta: IDEMPOTENT_CONSUMER_META,
    load: () =>
      import('../../features/system-designs/idempotent-consumer/idempotent-consumer.content'),
  },
  {
    meta: COMPETING_CONSUMERS_META,
    load: () =>
      import('../../features/system-designs/competing-consumers/competing-consumers.content'),
  },
  {
    meta: SCATTER_GATHER_META,
    load: () => import('../../features/system-designs/scatter-gather/scatter-gather.content'),
  },
  {
    meta: THROTTLING_META,
    load: () => import('../../features/system-designs/throttling/throttling.content'),
  },
  {
    meta: RATE_LIMITER_PATTERN_META,
    load: () =>
      import('../../features/system-designs/rate-limiter-pattern/rate-limiter-pattern.content'),
  },
  {
    meta: CACHE_ASIDE_META,
    load: () => import('../../features/system-designs/cache-aside/cache-aside.content'),
  },
  {
    meta: READ_WRITE_THROUGH_CACHE_META,
    load: () =>
      import('../../features/system-designs/read-write-through-cache/read-write-through-cache.content'),
  },
  {
    meta: WRITE_BEHIND_CACHE_META,
    load: () =>
      import('../../features/system-designs/write-behind-cache/write-behind-cache.content'),
  },
  {
    meta: MATERIALIZED_VIEW_META,
    load: () => import('../../features/system-designs/materialized-view/materialized-view.content'),
  },
  {
    meta: SHARDING_PATTERN_META,
    load: () => import('../../features/system-designs/sharding-pattern/sharding-pattern.content'),
  },
  {
    meta: CONSISTENT_HASHING_META,
    load: () =>
      import('../../features/system-designs/consistent-hashing/consistent-hashing.content'),
  },
  {
    meta: QUORUM_META,
    load: () => import('../../features/system-designs/quorum/quorum.content'),
  },
  {
    meta: GOSSIP_PROTOCOL_META,
    load: () => import('../../features/system-designs/gossip-protocol/gossip-protocol.content'),
  },
  {
    meta: NETFLIX_META,
    load: () => import('../../features/system-designs/netflix/netflix.content'),
  },
  {
    meta: WHATSAPP_META,
    load: () => import('../../features/system-designs/whatsapp/whatsapp.content'),
  },
  {
    meta: URL_SHORTENER_META,
    load: () => import('../../features/system-designs/url-shortener/url-shortener.content'),
  },
  {
    meta: UBER_META,
    load: () => import('../../features/system-designs/uber/uber.content'),
  },
  {
    meta: TWITTER_META,
    load: () => import('../../features/system-designs/twitter/twitter.content'),
  },
  {
    meta: YOUTUBE_META,
    load: () => import('../../features/system-designs/youtube/youtube.content'),
  },
  {
    meta: INSTAGRAM_META,
    load: () => import('../../features/system-designs/instagram/instagram.content'),
  },
  {
    meta: DISCORD_META,
    load: () => import('../../features/system-designs/discord/discord.content'),
  },
  {
    meta: RATE_LIMITER_META,
    load: () => import('../../features/system-designs/rate-limiter/rate-limiter.content'),
  },
  {
    meta: NOTIFICATION_SYSTEM_META,
    load: () =>
      import('../../features/system-designs/notification-system/notification-system.content'),
  },
  {
    meta: DISTRIBUTED_CACHE_META,
    load: () => import('../../features/system-designs/distributed-cache/distributed-cache.content'),
  },
  {
    meta: PAYMENT_GATEWAY_META,
    load: () => import('../../features/system-designs/payment-gateway/payment-gateway.content'),
  },
  {
    meta: ZOMATO_META,
    load: () => import('../../features/system-designs/zomato/zomato.content'),
  },
  {
    meta: SPOTIFY_META,
    load: () => import('../../features/system-designs/spotify/spotify.content'),
  },
  {
    meta: AMAZON_META,
    load: () => import('../../features/system-designs/amazon/amazon.content'),
  },
  {
    meta: DROPBOX_META,
    load: () => import('../../features/system-designs/dropbox/dropbox.content'),
  },
  {
    meta: CAP_PACELC_META,
    load: () => import('../../features/system-designs/cap-pacelc/cap-pacelc.content'),
  },
  {
    meta: DELIVERY_SEMANTICS_META,
    load: () =>
      import('../../features/system-designs/delivery-semantics/delivery-semantics.content'),
  },
  {
    meta: BACK_OF_ENVELOPE_META,
    load: () => import('../../features/system-designs/back-of-envelope/back-of-envelope.content'),
  },
  {
    meta: ID_GENERATION_META,
    load: () => import('../../features/system-designs/id-generation/id-generation.content'),
  },
  {
    meta: LOAD_BALANCING_PATTERN_META,
    load: () =>
      import('../../features/system-designs/load-balancing-pattern/load-balancing-pattern.content'),
  },
  {
    meta: SERVICE_MESH_META,
    load: () => import('../../features/system-designs/service-mesh/service-mesh.content'),
  },
  {
    meta: VENDING_MACHINE_META,
    load: () => import('../../features/system-designs/vending-machine/vending-machine.content'),
  },
  {
    meta: HOTEL_RESERVATION_META,
    load: () => import('../../features/system-designs/hotel-reservation/hotel-reservation.content'),
  },
];
