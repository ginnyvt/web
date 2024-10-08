import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Container } from '@/components/Container'
import { formatDate } from '@/lib/formatDate'
import { Work, getWorks } from '@/lib/works'
import { getProfile } from '@/lib/profile'
import { Media } from '@/types/media'
import { Blog, getBlogs } from '@/lib/blogs'
import { ArrowDownIcon, BriefcaseIcon, MailIcon } from '@/components/Icons'
import { Metadata } from 'next'
import { generateSeoMeta } from '@/lib/hepler'
import { ArticleList } from '@/components/ArticleList'

function SocialLink({
  icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  icon: Media
}) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Image
        src={icon.attributes.url}
        alt={icon.attributes.caption}
        className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300"
        unoptimized
        width={icon.attributes.width}
        height={icon.attributes.height}
      />
    </Link>
  )
}

async function Role({ role }: { role: Work }) {
  const endLabel = role.attributes.end ?? 'Present'
  const endDate = role.attributes.end ?? new Date().getFullYear().toString()

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        <Image
          src={role.attributes.logo.data.attributes.url}
          alt={role.attributes.logo.data.attributes.caption}
          className="h-7 w-7"
          width={role.attributes.logo.data.attributes.width}
          height={role.attributes.logo.data.attributes.height}
        />
      </div>
      <dl className="flex flex-auto flex-wrap gap-x-2">
        <dt className="sr-only">Role</dt>
        <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {role.attributes.title}
        </dd>
        <dt className="sr-only">Company</dt>
        <dd className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.attributes.company} | {role.attributes.place}
        </dd>
        <dt className="sr-only">Date</dt>
        <dd
          className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
          aria-label={`${role.attributes.start} until ${endLabel}`}
        >
          <time dateTime={role.attributes.start}>{role.attributes.start}</time>{' '}
          <span aria-hidden="true">—</span>{' '}
          <time dateTime={endDate}>{endLabel}</time>
        </dd>
      </dl>
    </li>
  )
}

async function Resume() {
  const works = await getWorks()

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {works.data.map((work) => (
          <Role key={work.id} role={work} />
        ))}
      </ol>
      <Button
        href="https://ginnyvt.github.io/GinnyTran_CV.pdf"
        variant="secondary"
        className="group mt-6 w-full"
      >
        Download CV
        <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
      </Button>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const seo = generateSeoMeta('', profile.data.attributes.seo, 'profile', 'en')
  return {
    ...seo,
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} - ${profile.data.attributes.title}`,
  }
}

export default async function Home() {
  console.log('[Homepage] rendering')

  const blogs = await getBlogs(
    0,
    parseInt(process.env.NEXT_PUBLIC_HOME_PAGE_SIZE!),
  )

  const profile = await getProfile()

  return (
    <>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            {profile.data.attributes.title}
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {profile.data.attributes.welcome}
          </p>
          <div className="mt-6 flex gap-6">
            {profile.data.attributes.socials.map((social, idx) => (
              <SocialLink
                key={idx}
                href={social.href}
                aria-label={social.title}
                icon={social.icon.data}
              />
            ))}
          </div>
        </div>
      </Container>
      <Container className="mt-16 sm:mt-20">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {blogs.data.map((blog) => (
              <ArticleList key={blog.id} article={blog} type="compact" />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
          </div>
        </div>
      </Container>
    </>
  )
}
