export function convertFetchResponse(resp: Response) {
    if (!resp.ok) {
        return resp.json().catch((_err) => {
            throw new Error(`${resp.status} ${resp.statusText}`);
        }).then((respJson) => {
            throw new Error(`${respJson["status_code"]}: ${respJson["detail"]}`)
        });
    }
    return resp.json()
}
