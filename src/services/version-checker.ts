const VERSION_KEY = 'app-version';

export const getStoredVersion = (): string | null => {
  return localStorage.getItem(VERSION_KEY);
};

export const setStoredVersion = (version: string): void => {
  localStorage.setItem(VERSION_KEY, version);
};

export const checkAndUpdateVersion = async (): Promise<boolean> => {
  try {
    // キャッシュを無効化するために、リクエストURLにタイムスタンプを追加
    const versionUrl = `/version.json?_t=${Date.now()}`;

    // fetch APIを使用してバージョン情報を取得
    const response = await fetch(versionUrl, {
      cache: 'no-store' // ブラウザキャッシュを完全に無効化
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch version. Status: ${response.status}`);
    }

    // JSONとしてパース
    const versionInfo = await response.json();
    const latestVersion = versionInfo.version;
    const currentVersion = getStoredVersion();

    // 初回訪問時
    if (currentVersion === null) {
      setStoredVersion(latestVersion);
      return false;
    }

    // バージョンが異なる場合は更新を検知
    if (latestVersion !== currentVersion) {
      console.log(`Application update detected: from ${currentVersion} to ${latestVersion}`);
      return true;
    }

    return false;

  } catch (error) {
    console.error('Failed to check for application updates:', error);
    return false;
  }
};
