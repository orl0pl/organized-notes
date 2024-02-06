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
import { Notatka } from "@/interfaces/note";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await sessionServerSideProps(context);
	return {
		...session,
	};
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
	const router = useRouter();
    const [currentNote, setCurrentNote] = useState<Notatka | undefined>(undefined);
    const [noteName, setNoteName] = useState("");
    const [noteTags, setNoteTags] = useState<{klucz: string,wartosc: string}[]>([]);
    const [tagKey, setTagKey] = useState("");
    const [tagValue, setTagValue] = useState("");
    const [noteContent, setNoteContent] = useState("");


	useEffect(() => {
		fetch("/api/note/" + router.query.id)
			.then((res) => res.json())
			.then((data) => setCurrentNote(data));
		setNoteContent(currentNote?.tekst || "");
		fetch("/api/note-tags/" + router.query.id)
			.then((res) => res.json())
			.then((data) => setNoteTags(data));
	}, [currentNote?.tekst, router.query.id]);
	return (
		<div className={"app " + roboto.className}>
			{currentNote ? (
				<main
					style={{
						padding: 16,
					}}
				>
					<h1>
						Note: {currentNote.nazwa} <button onClick={() => {
							fetch("/api/folder/" + router.query.id, {
								method: "DELETE",
							});
						}}>delete folder</button>
					</h1>

					<label>
						Note name:
						<input
							type="text"
							name="noteName"
							value={noteName}
							onChange={(e) => setNoteName(e.target.value)}
						/>
					</label>
					<button
						onClick={() => {
							fetch("/api/note/" + router.query.id, {
								method: "PUT",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									nazwa: noteName,
									osoba: loggedInUser.id,
                                    
								}),
							});
							fetch("/api/note/" + router.query.id)
								.then((res) => res.json())
								.then((data) => {
                                    setCurrentNote(data);
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
							{noteTags.map((tag) => (
								<tr key={tag.klucz}>
									<td>{tag.klucz}</td>
									<td>{tag.wartosc}</td>
									<td><button onClick={()=>{
										fetch("/api/note-tags/" + router.query.id, {
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
										fetch("/api/note-tags/" + router.query.id, {
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
									fetch("/api/note-tags/" + router.query.id, {
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
					<textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)}>
						{currentNote.tekst}
					</textarea>
					<button onClick={()=>{
						fetch("/api/note/" + router.query.id, {
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								nazwa: noteName,
								id: router.query.id,
								osoba: loggedInUser.id,
								tekst: noteContent
							}),
						})
					}}>Save</button>
					{router.query.id?.toString() || "udef"}
				</main>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
}
