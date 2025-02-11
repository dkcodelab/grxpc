import { ClientReadableStream, Metadata, RpcError, Status } from 'grpc-web';
import { Observable } from 'rxjs';

export type StreamEvent<TResponse> =
  | { type: 'status'; status: Status }
  | { type: 'metadata'; metadata: Metadata }
  | { type: 'data'; data: TResponse }
  | { type: 'end' };

/**
 * Converts gRPC client reable stream into observable object
 * to process the stream via RxJS library
 * @param stream gRPC client readable stream from the send
 * @returns observable with events based on the stream
 */
export function grpcStreamToObservable<TResponse>(
  stream: ClientReadableStream<TResponse>
): Observable<StreamEvent<TResponse>> {
  return new Observable((sub) => {
    const handleError = (err: RpcError) => {
      sub.error(err);
    };
    const handleStatus = (status: Status) => {
      sub.next({ type: 'status', status });
    };
    const handleMetadata = (metadata: Metadata) => {
      sub.next({ type: 'metadata', metadata });
    };
    const handleData = (data: TResponse) => {
      sub.next({ type: 'data', data });
    };
    const handleEnd = () => {
      sub.complete();
      stream.removeListener('error', handleError);
      stream.removeListener('status', handleStatus);
      stream.removeListener('metadata', handleMetadata);
      stream.removeListener('data', handleData);
      stream.removeListener('end', handleEnd);
    };

    stream.on('error', handleError);
    stream.on('status', handleStatus);
    stream.on('metadata', handleMetadata);
    stream.on('data', handleData);
    stream.on('end', handleEnd);
  });
}

/**
 * Converts gRPC stream into observable object with list of data
 * @param stream gRPC client readable stream from the send
 * @returns observable from stream with lost of caught values
 */
export function grpcStreamToCompleteObservable<TResponse>(
  stream: ClientReadableStream<TResponse>
): Observable<TResponse[]> {
  return new Observable((sub) => {
    const dataList: TResponse[] = [];
    const handleError = (err: RpcError) => {
      sub.error(err);
    };
    const handleData = (data: TResponse) => {
      dataList.push(data);
    };
    const handleEnd = () => {
      sub.next(dataList);
      sub.complete();
      stream.removeListener('error', handleError);
      stream.removeListener('data', handleData);
      stream.removeListener('end', handleEnd);
    };

    stream.on('error', handleError);
    stream.on('data', handleData);
    stream.on('end', handleEnd);
  });
}
