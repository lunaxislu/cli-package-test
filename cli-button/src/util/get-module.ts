// GitHub에서 파일 내용을 가져오는 함수
export async function getFileContentFromGithub(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return await response.text(); // 파일의 내용을 텍스트로 가져옴
}

/**
 * 가장 간단한 방법:

GitHub Raw URL을 통한 파일 내용 가져오기. 공용 레포지토리에서 파일을 가져오고, 파일 내용만 필요한 경우 가장 효율적입니다.
비공개 레포지토리 또는 인증이 필요한 경우:

GitHub API를 사용해 파일의 내용을 가져오는 것이 적합합니다. API를 통해 추가 메타데이터도 활용할 수 있고, 비공개 레포지토리에서도 사용할 수 있습니다.
대용량 파일을 다운로드 후 처리해야 하는 경우:

직접 파일을 다운로드하는 방식을 사용하면 좋습니다. 파일을 로컬에 저장하고, 스트리밍 방식으로 처리할 수 있습니다.
 */
