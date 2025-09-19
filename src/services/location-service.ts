export class LocationService {
  /**
   * 現在位置の緯度・経度を取得（ユーザに許可を確認）
   * 許可されなかった場合や失敗した場合は null を返す
   * @returns Promise<{ lat: number; lng: number } | null>
   */
  static async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    if (!navigator.geolocation) {
      console.warn("このブラウザは位置情報取得に対応していません。");
      return null;
    }

    try {
      const permission = await (navigator as any).permissions?.query?.({ name: "geolocation" });
      
      if (permission && permission.state === "denied") {
        console.warn("ユーザーが位置情報の利用を拒否しました。");
        return null;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => {
            console.warn(`位置情報の取得に失敗しました: ${err.message}`);
            resolve(null); // エラー時は null を返す
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (e) {
      console.warn("位置情報の利用可否確認に失敗しました。", e);
      return null;
    }
  }
}