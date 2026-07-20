import { collection, config, fields } from "@keystatic/core";

const storage =
  process.env.NODE_ENV === "production" &&
  Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?.trim())
    ? ({
        kind: "github",
        repo: "nimdalkr/nimdalxyz"
      } as const)
    : ({ kind: "local" } as const);

const requiredText = (label: string, description?: string) =>
  fields.text({
    label,
    description,
    validation: { isRequired: true }
  });

const localizedMetadata = (language: "한국어" | "English") =>
  fields.object(
    {
      title: requiredText(`${language} 제목`),
      description: fields.text({
        label: `${language} 요약`,
        multiline: true,
        validation: { isRequired: true }
      }),
      category: requiredText(`${language} 카테고리`),
      tags: fields.array(requiredText(`${language} 태그`), {
        label: `${language} 태그`,
        description: "태그 순서는 한국어와 영어에서 서로 맞춰 주세요.",
        itemLabel: ({ value }) => value,
        validation: { length: { min: 1 } }
      }),
      readingTime: requiredText(
        `${language} 읽는 시간`,
        language === "한국어" ? "예: 4분" : "Example: 4 min read"
      )
    },
    {
      label: language,
      layout: [12, 12, 6, 6, 12]
    }
  );

export default config({
  storage,
  locale: "ko-KR",
  ui: {
    brand: {
      name: "Nimdal BLOG"
    },
    navigation: {
      BLOG: ["posts"]
    }
  },
  collections: {
    posts: collection({
      label: "블로그 글",
      slugField: "slug",
      path: "content/blog/posts/*/",
      entryLayout: "form",
      columns: ["slug", "status", "publishedAt", "updatedAt"],
      schema: {
        slug: fields.slug({
          name: {
            label: "고유 주소",
            description: "공개 후에는 기존 링크를 위해 바꾸지 않는 것을 권장합니다.",
            validation: {
              isRequired: true,
              pattern: {
                regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "영문 소문자, 숫자, 하이픈만 사용할 수 있습니다."
              }
            }
          },
          slug: {
            label: "URL slug",
            description: "blog.nimdal.xyz/{언어}/posts/{slug}에 사용됩니다."
          }
        }),
        status: fields.select({
          label: "사이트 노출 상태",
          description: "초안은 사이트에서 숨겨지지만 공개 GitHub 저장소에서는 보입니다.",
          options: [
            { label: "사이트 비노출 · 저장소 공개", value: "draft" },
            { label: "공개", value: "published" }
          ],
          defaultValue: "published"
        }),
        publishedAt: fields.date({
          label: "발행일",
          validation: { isRequired: true }
        }),
        updatedAt: fields.date({
          label: "수정일",
          validation: { isRequired: true }
        }),
        cover: fields.image({
          label: "대표 이미지",
          directory: "public/media/blog",
          publicPath: "/media/blog/",
          validation: { isRequired: true },
          description: "프로젝트 캡처, 실사 사진, NFT PFP만 사용합니다."
        }),
        coverWidth: fields.integer({
          label: "대표 이미지 너비(px)",
          validation: { isRequired: true, min: 1 },
          description: "이미지를 교체했다면 원본 픽셀 너비도 함께 수정합니다."
        }),
        coverHeight: fields.integer({
          label: "대표 이미지 높이(px)",
          validation: { isRequired: true, min: 1 },
          description: "이미지를 교체했다면 원본 픽셀 높이도 함께 수정합니다."
        }),
        ko: localizedMetadata("한국어"),
        en: localizedMetadata("English"),
        bodyKo: fields.markdoc({
          label: "한국어 본문",
          description: "공개되는 한국어 글 본문입니다.",
          extension: "md"
        }),
        bodyEn: fields.markdoc({
          label: "English body",
          description: "The published English article body.",
          extension: "md"
        })
      }
    })
  }
});
