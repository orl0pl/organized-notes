import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
// import { Button, LayoutWithNavigationBar, NavigationBar, Text, ThemeProvider, useTheme } from "md3-react";
import { Ribeye, Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import {
	mdiAbTesting,
	mdiCog,
	mdiGlobeModel,
	mdiHome,
	mdiWeatherNight,
	mdiWeatherSunny,
} from "@mdi/js";
import { hexFromArgb } from "@material/material-color-utilities";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext, NextApiRequest } from "next";
import Cookies from "cookies";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";
import { useRouter } from "next/router";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await sessionServerSideProps(context);
	return {
		...session,
	};
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
	// const { updateSourceColor, scheme, toggleMode, sourceColor, mode } =
	//   useTheme();
	const [folders, setFolders] = useState<Folder[]>([]);
	const [currentFolder, setCurrentFolder] = useState<Folder | undefined>(undefined);
	const [currentFolderTags, setCurrentFolderTags] = useState<{klucz: string, wartosc: string}[]>([]);
	const [tagValue, setTagValue] = useState("");
	const [tagKey, setTagKey] = useState("");
	const [folderName, setFolderName] = useState("");
	const router = useRouter();

	useEffect(() => {
		fetch("/api/folders-inside/" + router.query.id)
			.then((res) => {
				if (res.status === 404) {
					alert("Folder not found");
				}
				return res.json();
			})
			.then((data) => {
				setFolders(data);
			})
		fetch("/api/folder/" + router.query.id)
		.then((res) => {
			if (res.status === 404) {
				alert("Folder not found");
			}
			return res.json();
		})
			.then((data) => setCurrentFolder(data));
		fetch("/api/folder-tags/"+router.query.id)
		.then((res) => {
			if (res.status === 404) {
				alert("Folder not found");
			}
			return res.json();
		}).then((data) => setCurrentFolderTags(data))
	}, [router.query.id]);
	return (
		<div className={"app " + roboto.className}>
			{currentFolder ? (
				<main
					style={{
						padding: 16,
					}}
				>
					<h1>
						Folder: {currentFolder.nazwa} <button onClick={() => {
							fetch("/api/folder/" + router.query.id, {
								method: "DELETE",
							});
						}}>delete folder</button>
					</h1>

					<label>
						Folder Name:
						<input
							type="text"
							name="folderName"
							value={folderName}
							onChange={(e) => setFolderName(e.target.value)}
						/>
					</label>
					<button
						onClick={() => {
							fetch("/api/folders-inside/" + router.query.id, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									nazwa: folderName,
									rodzic: router.query.id,
									osoba: loggedInUser.id,
								}),
							});
							fetch("/api/folders-inside/" + router.query.id)
								.then((res) => res.json())
								.then((data) => {
									setFolders(data);
								});
						}}
					>
						Create New Folder Inside
					</button>
					<button
						onClick={() => {
							fetch("/api/folder/" + router.query.id, {
								method: "PUT",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									nazwa: folderName,
									id: router.query.id,
									osoba: loggedInUser.id,
									rodzic: currentFolder.rodzic,
								}),
							});
							fetch("/api/folder/" + router.query.id)
								.then((res) => res.json())
								.then((data) => {
									setFolders(data);
								});
						}}
					>
						Change Folder Name
					</button>
					Tags:
					<table>
						<thead>
							<tr>
								<th>Key</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{currentFolderTags.map((tag) => (
								<tr key={tag.klucz}>
									<td>{tag.klucz}</td>
									<td>{tag.wartosc}</td>
									<td><button onClick={()=>{
										fetch("/api/folder-tags/" + router.query.id, {
											method: "PUT",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												klucz: tag.klucz,
												wartosc: tagValue,
												
											}),
										})
									}}>Edit</button><button onClick={()=>{
										fetch("/api/folder-tags/" + router.query.id, {
											method: "DELETE",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												klucz: tag.klucz,
												
											}),
										})
									}}>Delete</button></td>
								</tr>
							))}
							<tr>
								<td>
									<input
										type="text"
										name="key"
										value={tagKey}
										onChange={(e) => setTagKey(e.target.value)}
									/>
								</td>
								<td>
									<input
										type="text"
										name="value"
										value={tagValue}
										onChange={(e) => setTagValue(e.target.value)}
									/>
								</td>
								<td><button onClick={() => {
									fetch("/api/folder-tags/" + router.query.id, {
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											klucz: tagKey,
											wartosc: tagValue
											
										}),
									})
								}}>Add</button></td>
							</tr>
						</tbody>
					</table>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: 16,
						}}
					>
						{folders?.length ? (
							folders.map((folder: Folder) => (
								<div key={folder.id}>
									<Link href={`/folder/${folder.id}`} key={folder.id}>
										{folder.nazwa}
									</Link>
									- Created by {folder.osoba}
								</div>
							))
						) : (
							<p>No folders inside</p>
						)}
					</div>
					<pre>{JSON.stringify(folders, null, 2)}</pre>
					{router.query.id?.toString() || "udef"}
				</main>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
}
